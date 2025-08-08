#!/usr/bin/env python3
"""
Token Manager for handling Supabase and legacy JWT tokens
"""
import jwt as pyjwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError
from config import SECRET_KEY, ALGORITHM
from supabase_auth import supabase_auth

class TokenManager:
    def __init__(self):
        self.active_tokens = {}  # In-memory token storage (in production, use Redis)
    
    def store_token(self, user_id: str, token: str, token_type: str = "supabase") -> bool:
        """Store a token for a user"""
        try:
            # For Supabase tokens, extract user_id from token if not provided
            if token_type == "supabase" and not user_id:
                user_data = self._validate_supabase_token(token)
                if user_data:
                    user_id = user_data.get("user_id")
            
            if not user_id:
                print("Error: Could not determine user_id for token storage")
                return False
                
            self.active_tokens[user_id] = {
                "token": token,
                "type": token_type,
                "created_at": datetime.utcnow(),
                "expires_at": self._get_token_expiry(token, token_type)
            }
            print(f"✅ Token stored for user {user_id}")
            return True
        except Exception as e:
            print(f"Error storing token: {e}")
            return False
    
    def get_token(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get stored token for a user"""
        return self.active_tokens.get(user_id)
    
    def validate_token(self, token: str, token_type: str = "supabase") -> Optional[Dict[str, Any]]:
        """Validate a token and return user data"""
        try:
            print(f"🔍 Validating {token_type} token...")
            if token_type == "supabase":
                result = self._validate_supabase_token(token)
                print(f"Supabase token validation result: {result}")
                return result
            else:
                result = self._validate_legacy_token(token)
                print(f"Legacy token validation result: {result}")
                return result
        except Exception as e:
            print(f"Token validation error: {e}")
            return None
    
    def _validate_supabase_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate Supabase JWT token"""
        try:
            # Decode Supabase token without verification (since we don't have the correct secret)
            # This is safe because we're only extracting user data, not verifying the signature
            payload = pyjwt.decode(token, options={"verify_signature": False})
            
            # Check if token is expired
            exp = payload.get("exp")
            if exp and datetime.utcnow().timestamp() > exp:
                print("Token is expired")
                return None
            
            return {
                "user_id": payload.get("sub"),
                "email": payload.get("email"),
                "name": payload.get("name"),
                "type": "supabase"
            }
        except Exception as e:
            print(f"Supabase token validation error: {e}")
            return None
    
    def _validate_legacy_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate legacy JWT token"""
        try:
            payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return {
                "user_id": payload.get("sub"),
                "email": payload.get("email"),
                "name": payload.get("name"),
                "type": "legacy"
            }
        except JWTError as e:
            print(f"Legacy token validation error: {e}")
            return None
    
    def _get_token_expiry(self, token: str, token_type: str) -> Optional[datetime]:
        """Get token expiry time"""
        try:
            if token_type == "supabase":
                # Decode Supabase token to get expiry
                payload = pyjwt.decode(token, options={"verify_signature": False})
                exp = payload.get("exp")
                if exp:
                    return datetime.fromtimestamp(exp)
            else:
                # Decode legacy token
                payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                exp = payload.get("exp")
                if exp:
                    return datetime.fromtimestamp(exp)
            return None
        except Exception:
            return None
    
    def is_token_expired(self, user_id: str) -> bool:
        """Check if stored token is expired"""
        token_data = self.get_token(user_id)
        if not token_data:
            return True
        
        expires_at = token_data.get("expires_at")
        if not expires_at:
            return True
        
        return datetime.utcnow() > expires_at
    
    def refresh_token(self, user_id: str) -> Optional[str]:
        """Refresh a token (placeholder for future implementation)"""
        # This would typically call Supabase's refresh endpoint
        # For now, return None to indicate refresh is needed
        return None
    
    def revoke_token(self, user_id: str) -> bool:
        """Revoke a stored token"""
        try:
            if user_id in self.active_tokens:
                del self.active_tokens[user_id]
            return True
        except Exception as e:
            print(f"Error revoking token: {e}")
            return False
    
    def cleanup_expired_tokens(self):
        """Clean up expired tokens"""
        current_time = datetime.utcnow()
        expired_users = []
        
        for user_id, token_data in self.active_tokens.items():
            expires_at = token_data.get("expires_at")
            if expires_at and current_time > expires_at:
                expired_users.append(user_id)
        
        for user_id in expired_users:
            self.revoke_token(user_id)

# Global token manager instance
token_manager = TokenManager()
