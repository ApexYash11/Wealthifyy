from supabase import create_client, Client
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from model import get_db, User
from dotenv import load_dotenv
import os
from typing import Optional
from jose import JWTError, jwt
import json

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

class SupabaseAuth:
    def __init__(self):
        self.supabase = supabase
    
    def verify_jwt_token(self, token: str) -> dict:
        """Verify JWT token from Supabase"""
        try:
            # Decode the JWT token
            payload = jwt.decode(
                token, 
                SUPABASE_ANON_KEY, 
                algorithms=["HS256"],
                audience="authenticated"
            )
            return payload
        except JWTError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    def get_user_from_token(self, token: str, db: Session) -> Optional[User]:
        """Get user from JWT token"""
        try:
            payload = self.verify_jwt_token(token)
            user_id = payload.get("sub")  # Supabase user UUID
            
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token payload")
            
            # Find user by supabase_id
            user = db.query(User).filter(User.supabase_id == user_id).first()
            
            if not user:
                # Try to find by email as fallback
                email = payload.get("email")
                if email:
                    user = db.query(User).filter(User.email == email).first()
                
                if not user:
                    raise HTTPException(status_code=401, detail="User not found")
            
            return user
            
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
    
    def create_user_from_supabase(self, supabase_user_data: dict, db: Session) -> User:
        """Create a new user in our database from Supabase user data"""
        try:
            # Extract user data from Supabase
            supabase_id = supabase_user_data.get("id")
            email = supabase_user_data.get("email")
            user_metadata = supabase_user_data.get("user_metadata", {})
            
            # Check if user already exists
            existing_user = db.query(User).filter(User.supabase_id == supabase_id).first()
            if existing_user:
                return existing_user
            
            # Create new user
            new_user = User(
                supabase_id=supabase_id,
                email=email,
                username=user_metadata.get("username") or email.split("@")[0],
                oauth_provider=user_metadata.get("provider"),
                oauth_id=user_metadata.get("sub"),
                avatar_url=user_metadata.get("avatar_url"),
                password_hash="supabase_auth"  # Placeholder for Supabase Auth users
            )
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            return new_user
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")
    
    def sign_up(self, email: str, password: str, user_data: dict = None) -> dict:
        """Sign up a new user with Supabase"""
        try:
            response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": user_data or {}
                }
            })
            
            if response.user:
                return {
                    "user": response.user,
                    "session": response.session
                }
            else:
                raise HTTPException(status_code=400, detail="Failed to create user")
                
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Sign up failed: {str(e)}")
    
    def sign_in(self, email: str, password: str) -> dict:
        """Sign in user with Supabase"""
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if response.user and response.session:
                return {
                    "user": response.user,
                    "session": response.session
                }
            else:
                raise HTTPException(status_code=401, detail="Invalid credentials")
                
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Sign in failed: {str(e)}")
    
    def sign_out(self, token: str) -> bool:
        """Sign out user with Supabase"""
        try:
            self.supabase.auth.sign_out()
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Sign out failed: {str(e)}")
    
    def reset_password(self, email: str) -> bool:
        """Send password reset email"""
        try:
            self.supabase.auth.reset_password_email(email)
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Password reset failed: {str(e)}")
    
    def update_password(self, token: str, new_password: str) -> bool:
        """Update user password"""
        try:
            self.supabase.auth.update_user({
                "password": new_password
            })
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Password update failed: {str(e)}")

# Initialize Supabase Auth instance
supabase_auth = SupabaseAuth()

# Dependency for getting current user from Supabase token
def get_current_user_supabase(
    authorization: str = Depends(lambda x: x.headers.get("Authorization")),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from Supabase JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    return supabase_auth.get_user_from_token(token, db) 