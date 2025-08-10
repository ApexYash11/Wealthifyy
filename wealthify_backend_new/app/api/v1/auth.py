from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from ...config.database import get_db
from ...core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token,
    verify_token
)
from ...models.user import User
from ...schemas.auth import (
    AuthResponse, 
    TokenValidationResponse, 
    RefreshTokenResponse, 
    MessageResponse,
    UserInfo
)
from ...api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=AuthResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login with username and password."""
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserInfo.from_orm(user)
    )

@router.post("/register", response_model=AuthResponse)
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    name: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.username == username) | (User.email == email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(password)
    user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        name=name
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserInfo.from_orm(user)
    )

@router.post("/validate", response_model=TokenValidationResponse)
async def validate_token(
    token: str = Form(...),
    db: Session = Depends(get_db)
):
    """Validate a JWT token."""
    payload = verify_token(token)
    if not payload:
        return TokenValidationResponse(valid=False, error="Invalid token")
    
    user_id = payload.get("sub")
    if not user_id:
        return TokenValidationResponse(valid=False, error="Invalid token payload")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        return TokenValidationResponse(valid=False, error="User not found")
    
    if not user.is_active:
        return TokenValidationResponse(valid=False, error="Inactive user")
    
    return TokenValidationResponse(
        valid=True,
        user_id=user.id,
        email=user.email,
        token_type=payload.get("type", "unknown")
    )

@router.get("/me", response_model=UserInfo)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return UserInfo.from_orm(current_user)

@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(
    refresh_token: str = Form(...)
):
    """Refresh access token using refresh token."""
    payload = verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Create new access token
    access_token = create_access_token(data={"sub": user_id})
    
    return RefreshTokenResponse(
        access_token=access_token,
        token_type="bearer"
    )

@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (invalidate token on client side)."""
    # In a real implementation, you might want to blacklist the token
    return MessageResponse(message="Successfully logged out")

# OAuth endpoints (placeholder - implement based on your OAuth provider)
@router.get("/oauth/google")
async def google_oauth():
    """Initiate Google OAuth flow."""
    # Implement Google OAuth flow
    pass

@router.get("/oauth/github")
async def github_oauth():
    """Initiate GitHub OAuth flow."""
    # Implement GitHub OAuth flow
    pass

@router.post("/oauth/callback")
async def oauth_callback():
    """Handle OAuth callback."""
    # Implement OAuth callback handling
    pass
