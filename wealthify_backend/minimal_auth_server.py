from fastapi import FastAPI, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
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

# Mock user data for testing
MOCK_USERS = {
    "test@example.com": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "password_hash": pwd_context.hash("password123"),
        "created_at": datetime.now()
    },
    "admin@example.com": {
        "id": 2,
        "username": "admin",
        "email": "admin@example.com",
        "password_hash": pwd_context.hash("admin123"),
        "created_at": datetime.now()
    }
}

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

def get_current_user(token: str = Depends(lambda x: x.headers.get("Authorization"))):
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
    
    # Find user in mock data
    for user in MOCK_USERS.values():
        if str(user["id"]) == user_id:
            return user
    raise credentials_exception

# Routes
@app.get("/")
async def root():
    return {"message": "Wealthify API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "auth_mode": "mock_jwt",
        "available_users": list(MOCK_USERS.keys())
    }

@app.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...)
):
    try:
        print(f"🔍 Login attempt - Username: '{username}'")
        
        # Find user by email or username
        user = None
        for email, user_data in MOCK_USERS.items():
            if email == username or user_data["username"] == username:
                user = user_data
                break
        
        if not user:
            print(f"❌ No user found with username/email: '{username}'")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print(f"✅ User found: ID={user['id']}, Username='{user['username']}', Email='{user['email']}'")
        
        # Verify password
        if not verify_password(password, user["password_hash"]):
            print(f"❌ Password verification failed")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print(f"✅ Password verified successfully")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user["id"])}, expires_delta=access_token_expires
        )
        return {
            "token": access_token,
            "user": {
                "id": str(user["id"]),
                "email": user["email"],
                "name": user["username"],
                "created_at": user["created_at"].isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.get("/users/me")
async def read_users_me(current_user = Depends(get_current_user)):
    return {
        "id": str(current_user["id"]),
        "email": current_user["email"],
        "username": current_user["username"]
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Wealthify Auth Server...")
    print(f"📝 Available test users:")
    for email, user in MOCK_USERS.items():
        print(f"   - {email} (password: password123)")
    uvicorn.run(app, host="0.0.0.0", port=8000)
