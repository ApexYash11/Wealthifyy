from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse, JSONResponse
from app.core.auth import (
    create_access_token,
    verify_password,
    get_password_hash,
)
from app.core.get_current_user_supabase import get_current_user
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    GoogleAuthRequest,
    OAuthResponse,
    GoogleAuthCallback,
)
from app.models.user import User
from app.core.database import get_db
from app.core.supabase_auth import supabase_auth
from sqlalchemy.orm import Session
from app.core.config import settings
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create user in Supabase
        response = await supabase_auth.sign_up_with_email(
            email=user_data.email,
            password=user_data.password,
            user_metadata={"full_name": user_data.full_name}
        )
        
        if not response.get("user"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user in Supabase"
            )
            
        # Create user in local database
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            supabase_id=response["user"]["id"]
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token"""
    try:
        # Authenticate with Supabase
        response = await supabase_auth.sign_in_with_email(
            email=form_data.username,
            password=form_data.password
        )
        
        if not response.get("session"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )
        
        # Get user from database
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user:
            # Create user in local database if they don't exist
            user = User(
                email=response["user"]["email"],
                full_name=response["user"].get("user_metadata", {}).get("full_name", ""),
                supabase_id=response["user"]["id"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Return access token
        return {
            "access_token": response["session"]["access_token"],
            "token_type": "bearer"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/google")
async def google_login() -> OAuthResponse:
    """Start Google OAuth flow"""
    try:
        # Get Google OAuth URL
        response = await supabase_auth.sign_in_with_google("")
        
        if not response.get("url"):
            return OAuthResponse(
                error="Failed to get Google OAuth URL"
            )
        
        return OAuthResponse(
            url=response["url"]
        )
        
    except Exception as e:
        return OAuthResponse(
            error=str(e)
        )

@router.post("/google/callback")
async def google_callback(
    callback_data: GoogleAuthCallback,
    db: Session = Depends(get_db)
) -> Token:
    """Handle Google OAuth callback"""
    try:
        if callback_data.error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=callback_data.error
            )
        
        if not callback_data.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authorization code is required"
            )
        
        # Get user session from Supabase
        response = await supabase_auth.sign_in_with_google(callback_data.code)
        
        if not response.get("session") or not response.get("user"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to authenticate with Google"
            )
        
        # Get or create user in database
        user = db.query(User).filter(User.email == response["user"]["email"]).first()
        
        if not user:
            user_data = response["user"]
            user = User(
                email=user_data["email"],
                full_name=user_data.get("user_metadata", {}).get("full_name", ""),
                supabase_id=user_data["id"],
                oauth_provider="google",
                oauth_id=user_data.get("user_metadata", {}).get("sub"),
                avatar_url=user_data.get("user_metadata", {}).get("avatar_url"),
                is_email_verified=user_data.get("email_confirmed", False),
                oauth_data=user_data.get("user_metadata"),
                last_sign_in_at=datetime.now()
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update existing user's OAuth data
            user_data = response["user"]
            db.query(User).filter(User.id == user.id).update({
                "oauth_provider": "google",
                "oauth_id": user_data.get("user_metadata", {}).get("sub"),
                "avatar_url": user_data.get("user_metadata", {}).get("avatar_url"),
                "oauth_data": user_data.get("user_metadata"),
                "is_email_verified": user_data.get("email_confirmed", False),
                "last_sign_in_at": datetime.now()
            })
            db.commit()
            db.refresh(user)
        
        return Token(
            access_token=response["session"]["access_token"],
            token_type="bearer",
            expires_in=response["session"].get("expires_in"),
            refresh_token=response["session"].get("refresh_token")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/me", response_model=UserResponse)
async def get_user_me(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.post("/logout")
async def logout():
    """Logout user"""
    try:
        await supabase_auth.sign_out()
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
