from fastapi import APIRouter, Depends, HTTPException, Response, status
from supabase import Client
from typing import Dict
from pydantic import BaseModel, EmailStr
from src.db.database import get_supabase
from src.auth.auth_utils import set_auth_cookie, clear_auth_cookies
from src.utils.logger import log_error, log_info

router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(
    request: SignUpRequest,
    response: Response,
    supabase: Client = Depends(get_supabase)
):
    """
    Register a new user
    """
    try:
        auth_response = await supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name
                }
            }
        })
        
        if auth_response.user:
            # Set auth cookies
            set_auth_cookie(
                response,
                auth_response.session.access_token,
                auth_response.session.refresh_token
            )
            
            log_info("User registered successfully", {"email": request.email})
            
            return {
                "message": "Registration successful",
                "user": auth_response.user
            }
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed"
        )
            
    except Exception as e:
        log_error(e, {"email": request.email})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login")
async def login(
    request: LoginRequest,
    response: Response,
    supabase: Client = Depends(get_supabase)
):
    """
    Login user
    """
    try:
        auth_response = await supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if auth_response.user:
            # Set auth cookies
            set_auth_cookie(
                response,
                auth_response.session.access_token,
                auth_response.session.refresh_token
            )
            
            log_info("User logged in successfully", {"email": request.email})
            
            return {
                "message": "Login successful",
                "user": auth_response.user
            }
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
            
    except Exception as e:
        log_error(e, {"email": request.email})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

@router.post("/logout")
async def logout(
    response: Response,
    supabase: Client = Depends(get_supabase)
):
    """
    Logout user
    """
    try:
        await supabase.auth.sign_out()
        clear_auth_cookies(response)
        return {"message": "Logged out successfully"}
    except Exception as e:
        log_error(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.post("/refresh")
async def refresh_token(
    response: Response,
    refresh_token: str,
    supabase: Client = Depends(get_supabase)
):
    """
    Refresh access token
    """
    try:
        auth_response = await supabase.auth.refresh_session(refresh_token)
        
        if auth_response.session:
            # Set new auth cookies
            set_auth_cookie(
                response,
                auth_response.session.access_token,
                auth_response.session.refresh_token
            )
            
            return {"message": "Token refreshed successfully"}
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
            
    except Exception as e:
        log_error(e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )
