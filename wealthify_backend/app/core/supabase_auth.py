from supabase import create_client, Client
from supabase.lib.client_options import SyncClientOptions
from gotrue import AuthResponse
from gotrue.types import SignInWithOAuthCredentials, Provider
from app.core.config import settings
from fastapi import HTTPException, status
from typing import Optional, Dict, Any, cast, TypeVar
from functools import lru_cache

T = TypeVar('T')

@lru_cache()
def get_supabase_client() -> Client:
    options = SyncClientOptions(
        schema="public",
        auto_refresh_token=True,
        persist_session=True
    )
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY,
        options=options
    )

class SupabaseAuth:
    def __init__(self):
        self.supabase: Client = get_supabase_client()

    async def sign_up_with_email(self, email: str, password: str, user_metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Register a new user with email and password"""
        try:
            # Create credentials using the direct dictionary approach
            response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": user_metadata or {}
                }
            })
            return cast(Dict[str, Any], response.model_dump())
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    async def sign_in_with_email(self, email: str, password: str) -> Dict[str, Any]:
        """Sign in a user with email and password"""
        try:
            # Sign in with email and password
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password,
                "options": {}  # Include empty options object for type compatibility
            })
            return cast(Dict[str, Any], response.model_dump())
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
    async def sign_in_with_oauth(self, provider_config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate OAuth URL for authentication"""
        try:
            credentials = {
                "provider": "google",
                "options": provider_config.get("options", {})
            }
            auth_response = self.supabase.auth.sign_in_with_oauth(credentials)
            return {"url": auth_response.url}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e)
            )

    async def sign_in_with_google(self, _: str) -> Dict[str, Any]:
        """Generate Google OAuth URL for authentication"""
        try:
            return await self.sign_in_with_oauth({
                "provider": "google",
                "options": {
                    "redirect_to": f"{settings.FRONTEND_URL}/auth/callback/google",
                    "scopes": "email profile"
                }
            })
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e)
            )

    async def sign_out(self) -> None:
        """Sign out the current user"""
        try:
            self.supabase.auth.sign_out()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    async def get_user(self, access_token: str) -> Dict[str, Any]:
        """Get user data from access token"""
        try:
            response = self.supabase.auth.get_user(access_token)
            if not response:
                raise ValueError("User not found")
            return cast(Dict[str, Any], response.model_dump())
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token using refresh token"""
        try:
            response = self.supabase.auth.refresh_session(refresh_token)
            return cast(Dict[str, Any], response.model_dump())
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

# Create a singleton instance
supabase_auth = SupabaseAuth()
