from fastapi import APIRouter, HTTPException, status, Depends, Response
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.supabase_auth import supabase_auth
from typing import Dict, Any, Optional
import logging
from pydantic import BaseModel

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LoginRequest(BaseModel):
    email: str
    password: str

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/login")
async def login(request: LoginRequest):
    """Handle email/password login through Supabase"""
    try:
        logger.info("Attempting login for user: %s", request.email)
        
        # Validate email
        if not request.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        if not '@' in request.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Validate password
        if not request.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required"
            )
        
        # Attempt login with Supabase
        logger.info("Making Supabase auth request...")
        auth_response = await supabase_auth.sign_in_with_email(
            email=request.email,
            password=request.password
        )
        logger.info("Supabase auth response received")
        
        if not auth_response:
            logger.error("No response from Supabase auth")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )
        
        # Extract the session token
        session = auth_response.get("session", {})
        access_token = session.get("access_token")
        
        if not access_token:
            logger.error("No access token in response")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Create response with token in both body and cookie
        json_response = JSONResponse(
            content={
                "access_token": access_token,
                "token_type": "bearer",
                "user": auth_response.get("user", {})
            }
        )
        
        # Set HTTP-only cookie
        json_response.set_cookie(
            key="auth_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
        logger.info("Login successful")
        return json_response
        
    except Exception as e:
        logger.error("Login failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

@router.get("/oauth/google")
async def google_oauth():
    """Handle Google OAuth login through Supabase"""
    try:
        logger.info("Initiating Google OAuth flow")
        response = await supabase_auth.sign_in_with_google("")
        return JSONResponse(content=response)
    except Exception as e:
        logger.error("Google OAuth failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/oauth/github")
async def github_oauth():
    """Handle GitHub OAuth login through Supabase"""
    try:
        logger.info("Initiating GitHub OAuth flow")
        response = await supabase_auth.sign_in_with_oauth({
            "provider": "github",
            "options": {
                "redirect_to": f"{settings.FRONTEND_URL}/auth/callback/github",
                "scopes": "read:user user:email"
            }
        })
        return JSONResponse(content={"url": response.get("url")})
    except Exception as e:
        logger.error("GitHub OAuth failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/logout")
async def logout(response: Response):
    """Handle user logout"""
    try:
        await supabase_auth.sign_out()
        response.delete_cookie("auth_token")
        return {"message": "Successfully logged out"}
    except Exception as e:
        logger.error("Logout failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )
