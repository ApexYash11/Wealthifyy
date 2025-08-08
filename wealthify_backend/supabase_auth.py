from supabase import create_client, Client
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from model import get_db, User
from dotenv import load_dotenv
import os
from typing import Optional
from jose import JWTError, jwt
import json

# Import configuration
from config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SECRET_KEY, ALGORITHM
from model import DATABASE_AVAILABLE

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")

# Initialize Supabase client
try:
    # Try without any additional options first
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
except Exception as e:
    print(f"Warning: Supabase client initialization failed: {e}")
    # Try alternative initialization without options
    try:
        from supabase import create_client as create_supabase_client
        supabase: Client = create_supabase_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    except Exception as e2:
        print(f"Alternative Supabase client initialization also failed: {e2}")
        # Try with minimal configuration
        try:
            import httpx
            supabase: Client = create_client(
                SUPABASE_URL, 
                SUPABASE_ANON_KEY,
                options={
                    "auth": {
                        "autoRefreshToken": False,
                        "persistSession": False
                    }
                }
            )
        except Exception as e3:
            print(f"Minimal Supabase client initialization also failed: {e3}")
            supabase = None

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
            app_metadata = supabase_user_data.get("app_metadata", {})
            
            # Check if user already exists by supabase_id
            existing_user = db.query(User).filter(User.supabase_id == supabase_id).first()
            if existing_user:
                return existing_user
            
            # Check if user exists by email (for OAuth users)
            if email:
                existing_user = db.query(User).filter(User.email == email).first()
                if existing_user:
                    # Update existing user with supabase_id
                    existing_user.supabase_id = supabase_id
                    existing_user.oauth_provider = app_metadata.get("provider")
                    existing_user.avatar_url = user_metadata.get("avatar_url")
                    db.commit()
                    db.refresh(existing_user)
                    return existing_user
            
            # Create new user
            username = user_metadata.get("username") or user_metadata.get("name") or email.split("@")[0]
            new_user = User(
                supabase_id=supabase_id,
                email=email,
                username=username,
                oauth_provider=app_metadata.get("provider"),
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
        if not self.supabase:
            raise HTTPException(status_code=500, detail="Supabase client not available")
            
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
    """Get current user from JWT token (supports both legacy and Supabase tokens)"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Import token manager
        from token_manager import token_manager
        
        # First try to validate token using token manager
        token_data = token_manager.validate_token(token, "supabase")
        if token_data:
            user_id = token_data.get("user_id")
            if DATABASE_AVAILABLE:
                # Try to find user in database
                user = db.query(User).filter(User.supabase_id == user_id).first()
                if user:
                    return user
            else:
                # Create mock user from token data when database is not available
                from model import User
                mock_user = User()
                mock_user.id = 1  # Default ID
                mock_user.email = token_data.get("email", "user@example.com")
                mock_user.username = token_data.get("name", token_data.get("email", "User").split("@")[0])
                mock_user.supabase_id = user_id
                return mock_user
        
        # Try legacy token validation
        token_data = token_manager.validate_token(token, "legacy")
        if token_data:
            user_id = token_data.get("user_id")
            if DATABASE_AVAILABLE:
                user = db.query(User).filter(User.id == int(user_id)).first()
                if user:
                    return user
            else:
                # Create mock user for legacy tokens when database is not available
                from model import User
                mock_user = User()
                mock_user.id = int(user_id)
                mock_user.email = token_data.get("email", "user@example.com")
                mock_user.username = token_data.get("name", "User")
                return mock_user
        
        # Fallback: Try direct token verification
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id and DATABASE_AVAILABLE:
                user = db.query(User).filter(User.id == int(user_id)).first()
                if user:
                    return user
        except JWTError:
            pass
        
        # If all else fails, try Supabase direct verification
        if supabase_auth.supabase and not DATABASE_AVAILABLE:
            try:
                user_data = supabase_auth.verify_jwt_token(token)
                if user_data:
                    from model import User
                    mock_user = User()
                    mock_user.id = 1
                    mock_user.email = user_data.get("email", "user@example.com")
                    mock_user.username = user_data.get("name", user_data.get("email", "User").split("@")[0])
                    mock_user.supabase_id = user_data.get("sub")
                    return mock_user
            except Exception as verify_error:
                print(f"Token verification failed: {verify_error}")
        
        raise HTTPException(status_code=401, detail="Invalid token")
            
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}") 