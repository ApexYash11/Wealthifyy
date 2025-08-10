from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Request schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: Optional[str] = None

class TokenValidationRequest(BaseModel):
    token: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class OAuthCallbackRequest(BaseModel):
    code: str
    state: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# Response schemas
class UserInfo(BaseModel):
    id: int
    username: str
    email: str
    name: Optional[str] = None
    is_active: bool
    is_verified: bool
    savings_goal: float
    current_savings: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserInfo

class TokenValidationResponse(BaseModel):
    valid: bool
    user_id: Optional[int] = None
    email: Optional[str] = None
    token_type: Optional[str] = None
    error: Optional[str] = None

class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str

class MessageResponse(BaseModel):
    message: str
