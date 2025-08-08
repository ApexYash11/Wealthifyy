from fastapi import FastAPI, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database models (simplified)
from model import get_db, User

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(lambda x: x.headers.get("Authorization")), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        if not token or not token.startswith("Bearer "):
            raise credentials_exception
        token = token.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.get("/")
async def root():
    return {"message": "Wealthify API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "auth_mode": "legacy_jwt"
    }

@app.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        print(f"🔍 Login attempt - Username: '{username}'")
        
        # Try to find user by username or email
        db_user = db.query(User).filter(User.username == username).first()
        if not db_user:
            # Try by email
            db_user = db.query(User).filter(User.email == username).first()
        
        if not db_user:
            print(f"❌ No user found with username/email: '{username}'")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print(f"✅ User found: ID={db_user.id}, Username='{db_user.username}', Email='{db_user.email}'")
        
        # Check if user has a password hash
        if not db_user.password_hash or db_user.password_hash == "supabase_auth":
            print(f"⚠️ User has no password hash, allowing login")
            # For users without password hash, allow login (temporary fix)
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": str(db_user.id)}, expires_delta=access_token_expires
            )
            return {
                "token": access_token,
                "user": {
                    "id": str(db_user.id),
                    "email": db_user.email,
                    "name": db_user.username,
                    "created_at": db_user.created_at.isoformat() if db_user.created_at else None
                }
            }
        else:
            # Verify password for users with password hash
            if not verify_password(password, db_user.password_hash):
                print(f"❌ Password verification failed")
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            print(f"✅ Password verified successfully")
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": str(db_user.id)}, expires_delta=access_token_expires
            )
            return {
                "token": access_token,
                "user": {
                    "id": str(db_user.id),
                    "email": db_user.email,
                    "name": db_user.username,
                    "created_at": db_user.created_at.isoformat() if db_user.created_at else None
                }
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
