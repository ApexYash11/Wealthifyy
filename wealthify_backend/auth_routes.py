"""
Comprehensive Authentication Routes for Wealthify Backend
Handles traditional JWT auth, Supabase OAuth, and session management
"""

from fastapi import APIRouter, Depends, HTTPException, Form, Body, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
import json
from pydantic import BaseModel
import httpx

from model import get_db, User, DATABASE_AVAILABLE
from schema import UserCreate, Token, LoginResponse
from supabase_auth import supabase_auth, get_current_user_supabase
from token_manager import token_manager
from config import (
    SECRET_KEY, 
    ALGORITHM, 
    ACCESS_TOKEN_EXPIRE_MINUTES,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY
)

# Initialize router
auth_router = APIRouter(prefix="/auth", tags=["authentication"])

# Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Pydantic models for auth requests
class OAuthCallbackRequest(BaseModel):
    code: str
    state: Optional[str] = None

class TokenValidationRequest(BaseModel):
    token: str

class LogoutRequest(BaseModel):
    token: Optional[str] = None

# Helper functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str):
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    """Hash password"""
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str):
    """Authenticate user with username/password"""
    if not DATABASE_AVAILABLE:
        # Mock authentication for testing
        if username == "test" and password == "test":
            mock_user = User()
            mock_user.id = 1
            mock_user.username = "test"
            mock_user.email = "test@example.com"
            return mock_user
        return None
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user

def get_user_by_email(db: Session, email: str):
    """Get user by email"""
    if not DATABASE_AVAILABLE:
        return None
    return db.query(User).filter(User.email == email).first()

# Authentication dependencies
def get_current_user_jwt(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    if not DATABASE_AVAILABLE:
        # Mock user for testing
        mock_user = User()
        mock_user.id = int(user_id)
        mock_user.username = "test"
        mock_user.email = "test@example.com"
        return mock_user
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_any(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get current user from any auth method (JWT, Supabase, or cookie)"""
    # Try to get token from Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        
        # Try Supabase token first
        try:
            return get_current_user_supabase(auth_header, db)
        except HTTPException:
            # Try JWT token
            try:
                return get_current_user_jwt(token, db)
            except HTTPException:
                pass
    
    # Try to get token from cookie
    token = request.cookies.get("auth_token")
    if token:
        try:
            return get_current_user_jwt(token, db)
        except HTTPException:
            pass
    
    raise HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

# Auth Routes

@auth_router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    response: Response = None
):
    """Traditional username/password login"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    # Store token
    token_manager.store_token(str(user.id), access_token, "jwt")
    
    # Set cookie if response is provided
    if response:
        response.set_cookie(
            key="auth_token",
            value=access_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.name or user.username
        }
    }

@auth_router.post("/register", response_model=LoginResponse)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    response: Response = None
):
    """Traditional user registration"""
    if not DATABASE_AVAILABLE:
        # Mock registration for testing
        mock_user = User()
        mock_user.id = 1
        mock_user.username = user_data.username
        mock_user.email = user_data.email
        mock_user.name = user_data.name
        mock_user.password = get_password_hash(user_data.password)
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(mock_user.id)}, expires_delta=access_token_expires
        )
        
        token_manager.store_token(str(mock_user.id), access_token, "jwt")
        
        if response:
            response.set_cookie(
                key="auth_token",
                value=access_token,
                httponly=True,
                secure=False,
                samesite="lax",
                max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": mock_user.id,
                "username": mock_user.username,
                "email": mock_user.email,
                "name": mock_user.name
            }
        }
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        name=user_data.name,
        password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id)}, expires_delta=access_token_expires
    )
    
    # Store token
    token_manager.store_token(str(db_user.id), access_token, "jwt")
    
    # Set cookie
    if response:
        response.set_cookie(
            key="auth_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "name": db_user.name
        }
    }

@auth_router.post("/validate")
async def validate_token(
    request: TokenValidationRequest,
    db: Session = Depends(get_db)
):
    """Validate any type of token (JWT or Supabase)"""
    token = request.token
    
    # Try Supabase token first
    try:
        user = get_current_user_supabase(f"Bearer {token}", db)
        return {
            "valid": True,
            "user_id": user.id,
            "email": user.email,
            "token_type": "supabase"
        }
    except HTTPException:
        pass
    
    # Try JWT token
    try:
        user = get_current_user_jwt(token, db)
        return {
            "valid": True,
            "user_id": user.id,
            "email": user.email,
            "token_type": "jwt"
        }
    except HTTPException:
        pass
    
    return {"valid": False, "error": "Invalid token"}

@auth_router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user_any)
):
    """Logout user and clear session"""
    # Revoke token
    token_manager.revoke_token(str(current_user.id))
    
    # Clear cookie
    response.delete_cookie("auth_token")
    
    return {"message": "Successfully logged out"}

# OAuth Routes

@auth_router.get("/oauth/google")
async def google_oauth_initiate():
    """Initiate Google OAuth flow"""
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="OAuth not configured")
    
    # Redirect to Supabase Google OAuth
    redirect_url = f"{SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to={os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth/callback"
    return RedirectResponse(url=redirect_url)

@auth_router.get("/oauth/github")
async def github_oauth_initiate():
    """Initiate GitHub OAuth flow"""
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="OAuth not configured")
    
    # Redirect to Supabase GitHub OAuth
    redirect_url = f"{SUPABASE_URL}/auth/v1/authorize?provider=github&redirect_to={os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth/callback"
    return RedirectResponse(url=redirect_url)

@auth_router.post("/oauth/callback")
async def oauth_callback(
    request: OAuthCallbackRequest,
    db: Session = Depends(get_db),
    response: Response = None
):
    """Handle OAuth callback from Supabase"""
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="OAuth not configured")
    
    try:
        # Exchange code for tokens using Supabase
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                f"{SUPABASE_URL}/auth/v1/token?grant_type=authorization_code",
                data={
                    "grant_type": "authorization_code",
                    "code": request.code,
                    "redirect_uri": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth/callback"
                },
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            )
            
            if token_response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to exchange code for tokens")
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                raise HTTPException(status_code=400, detail="No access token received")
            
            # Get user info from Supabase
            user_response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {access_token}"
                }
            )
            
            if user_response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to get user info")
            
            supabase_user = user_response.json()
            
            # Get or create user in our database
            user = supabase_auth.get_user_from_token(access_token, db)
            if not user:
                user = supabase_auth.create_user_from_supabase(supabase_user, db)
            
            # Store token
            token_manager.store_token(str(user.id), access_token, "supabase")
            
            # Set cookie
            if response:
                response.set_cookie(
                    key="auth_token",
                    value=access_token,
                    httponly=True,
                    secure=False,
                    samesite="lax",
                    max_age=3600  # 1 hour
                )
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "name": user.name
                }
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth callback failed: {str(e)}")

@auth_router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user_any)
):
    """Get current user information"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "name": current_user.name
    }

@auth_router.post("/refresh")
async def refresh_token(
    request: Request,
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    # Get refresh token from request
    refresh_token = request.headers.get("X-Refresh-Token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token required")
    
    try:
        # For Supabase tokens, use Supabase refresh
        if supabase_auth.supabase:
            refresh_response = supabase_auth.supabase.auth.refresh_session(refresh_token)
            if refresh_response.data.session:
                new_access_token = refresh_response.data.session.access_token
                return {"access_token": new_access_token, "token_type": "bearer"}
        
        # For JWT tokens, create new token
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = create_access_token(
            data={"sub": user_id}, expires_delta=access_token_expires
        )
        
        return {"access_token": new_access_token, "token_type": "bearer"}
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token refresh failed: {str(e)}")
