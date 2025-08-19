from pydantic_settings import BaseSettings
from pydantic import EmailStr
from typing import List
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Wealthify"
    VERSION: str = "1.0.0"
    
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ]
    
    # Frontend Settings
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Supabase Settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # Email Settings
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    MAIL_FROM: EmailStr = os.getenv("MAIL_FROM", "noreply@wealthify.com")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "")
    MAIL_FROM_NAME: str = os.getenv("MAIL_FROM_NAME", "Wealthify")
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
    
    # Business Logic Settings
    DEFAULT_SAVINGS_GOAL: float = float(os.getenv("DEFAULT_SAVINGS_GOAL", "10000.0"))
    DEFAULT_SAVINGS_RATE: float = float(os.getenv("DEFAULT_SAVINGS_RATE", "0.2"))
    EMERGENCY_FUND_MONTHS: int = int(os.getenv("EMERGENCY_FUND_MONTHS", "3"))
    
    class Config:
        case_sensitive = True

# Create settings instance
settings = Settings()

# Project paths
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
APP_DIR = ROOT_DIR / "app"
MODEL_DIR = APP_DIR / "ml" / "models"
