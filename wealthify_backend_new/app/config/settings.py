from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Application
    app_name: str = "Wealthify Backend"
    app_version: str = "1.0.0"
    debug: bool = True
    environment: str = "development"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True
    
    # Database
    database_url: str = "postgresql://username:password@localhost:5432/wealthify"
    database_url_async: str = "postgresql+asyncpg://username:password@localhost:5432/wealthify"
    
    # Security
    secret_key: str = "your-super-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # OAuth & External Services
    supabase_url: str = "https://your-project.supabase.co"
    supabase_anon_key: str = "your-supabase-anon-key"
    supabase_service_role_key: str = "your-service-role-key"
    
    # Google OAuth
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    
    # GitHub OAuth
    github_client_id: Optional[str] = None
    github_client_secret: Optional[str] = None
    
    # Email Configuration
    mail_username: Optional[str] = None
    mail_password: Optional[str] = None
    mail_from: str = "noreply@wealthify.com"
    mail_port: int = 587
    mail_server: str = "smtp.gmail.com"
    mail_from_name: str = "Wealthify"
    
    # CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000"
    ]
    
    # ML Models
    ml_model_path: str = "./ml/models/"
    budget_model_path: str = "./ml/budget_model.pkl"
    
    # Financial Data
    yahoo_finance_timeout: int = 10
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
