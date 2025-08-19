from fastapi import Depends, HTTPException, status, Response, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from typing import Optional
from src.db.database import get_supabase
from src.utils.logger import log_error, log_info

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase)
):
    """
    Validate JWT token and return current user
    """
    try:
        user = await supabase.auth.get_user(credentials.credentials)
        return user
    except Exception as e:
        log_error(e, {"token": credentials.credentials})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

def set_auth_cookie(response: Response, access_token: str, refresh_token: str):
    """
    Set secure httpOnly cookies for authentication tokens
    """
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=3600  # 1 hour
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 3600  # 7 days
    )

def clear_auth_cookies(response: Response):
    """
    Clear authentication cookies
    """
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
