from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext
from app.models.user import User
from app.schemas.auth import UserCreate, UserUpdate
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password"""
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Get password hash"""
        return pwd_context.hash(password)

    def create_user(self, user: UserCreate) -> User:
        """Create a new user"""
        try:
            # Hash password
            hashed_password = self.get_password_hash(user.password)
            
            # Create user object
            db_user = User(
                email=user.email,
                hashed_password=hashed_password,
                full_name=user.full_name
            )
            
            # Save to database
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            
            return db_user
        except Exception as e:
            self.db.rollback()
            raise e

    def authenticate_user(
        self,
        email: str,
        password: str
    ) -> Optional[User]:
        """Authenticate user"""
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()

    def update_user(
        self,
        user_id: str,
        user_update: UserUpdate
    ) -> Optional[User]:
        """Update user"""
        try:
            db_user = self.get_user(user_id)
            if not db_user:
                return None

            update_data = user_update.model_dump(exclude_unset=True)
            
            # Hash new password if provided
            if "password" in update_data:
                update_data["hashed_password"] = self.get_password_hash(
                    update_data.pop("password")
                )

            for field, value in update_data.items():
                setattr(db_user, field, value)

            self.db.commit()
            self.db.refresh(db_user)
            return db_user
        except Exception as e:
            self.db.rollback()
            raise e

    def create_access_token(
        self,
        user_id: str,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
            
        to_encode = {
            "sub": str(user_id),
            "exp": expire
        }
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        return encoded_jwt
