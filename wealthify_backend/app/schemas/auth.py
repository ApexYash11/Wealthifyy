from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
from datetime import datetime

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: str | None = None

class UserCreate(UserBase):
    """Schema for user creation"""
    password: str

class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str

class UserResponse(UserBase):
    """Schema for user response"""
    id: str
    is_active: bool
    avatar_url: Optional[str] = None
    oauth_provider: Optional[str] = None
    is_email_verified: bool = False
    last_sign_in_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    """Schema for JWT token"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int | None = None
    refresh_token: str | None = None

class TokenData(BaseModel):
    """Schema for token data"""
    email: str | None = None
    sub: str | None = None
    exp: int | None = None

class OAuthResponse(BaseModel):
    """Schema for OAuth response"""
    url: str | None = None
    access_token: str | None = None
    token_type: str = "bearer"
    user: Dict[str, Any] | None = None
    error: str | None = None

class UserUpdate(UserBase):
    """Schema for user update"""
    password: str | None = None
    is_active: bool | None = None
    avatar_url: str | None = None

class GoogleAuthRequest(BaseModel):
    """Schema for Google OAuth authentication"""
    code: str | None = None
    access_token: str | None = None

class GoogleAuthCallback(BaseModel):
    """Schema for Google OAuth callback data"""
    code: str
    state: str | None = None
    error: str | None = None
