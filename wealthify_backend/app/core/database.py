
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException
from app.core.config import settings
import asyncio
import ssl
import os
from urllib.parse import urlparse
from typing import Dict, Any, Optional, Tuple

def prepare_database_config() -> Tuple[Optional[str], Dict[str, Any]]:
    """
    Prepare database configuration with automatic SSL handling.
    
    This function:
    1. Reads DATABASE_URL from environment
    2. Automatically detects if SSL is needed (cloud vs local)
    3. Removes unsupported sslmode parameters from URL
    4. Sets up proper SSL context for asyncpg
    5. Handles development vs production SSL verification
    """
    
    # Get database URL from settings
    raw_database_url = settings.DATABASE_URL
    
    if not raw_database_url:
        print("❌ No DATABASE_URL found in environment variables")
        return None, {}
    
    print("✅ Using DATABASE_URL from environment")
    
    # Check if we're in development mode (affects SSL verification)
    is_development = os.getenv("ENVIRONMENT", "development").lower() in ["development", "dev", "local"]
    
    # Parse the database URL to detect environment and clean it
    parsed_url = urlparse(raw_database_url)
    
    # Clean the URL by removing sslmode parameter if present
    query_params = []
    if parsed_url.query:
        for param in parsed_url.query.split('&'):
            if not param.startswith('sslmode='):
                query_params.append(param)
    
    # Reconstruct clean URL
    clean_query = '&'.join(query_params) if query_params else ''
    clean_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}"
    if clean_query:
        clean_url += f"?{clean_query}"
    
    # Determine if SSL is needed based on host
    host = parsed_url.hostname or ""
    is_local = (
        host in ['localhost', '127.0.0.1', '::1'] or
        host.endswith('.local') or
        host.startswith('192.168.') or
        host.startswith('10.') or
        (host.startswith('172.') and len(host.split('.')) >= 2 and 
         host.split('.')[1].isdigit() and 16 <= int(host.split('.')[1]) <= 31)
    )
    
    # Prepare connection arguments
    connect_args: Dict[str, Any] = {
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "timeout": 30
    }
    
    # Add SSL configuration for cloud databases
    if not is_local and host:
        print(f"🔐 Detected cloud database ({host}), enabling SSL")
        
        # Special handling for Supabase and other cloud providers
        if 'supabase.co' in host:
            print("🔑 Configuring SSL for Supabase")
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False  # Supabase uses pooler hostnames
            
            # In development, skip certificate verification for easier setup
            # In production, you might want to set ENVIRONMENT=production
            if is_development:
                print("⚠️  Development mode: Disabling SSL certificate verification")
                ssl_context.verify_mode = ssl.CERT_NONE
            else:
                print("🔒 Production mode: SSL certificate verification enabled")
                ssl_context.verify_mode = ssl.CERT_REQUIRED
            
            connect_args["ssl"] = ssl_context
        else:
            # For other cloud providers (Railway, Neon, Heroku, etc.)
            print("🔑 Configuring SSL for cloud provider")
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False  # Many cloud providers use different hostnames
            
            if is_development:
                ssl_context.verify_mode = ssl.CERT_NONE  # More permissive for dev
            else:
                ssl_context.verify_mode = ssl.CERT_REQUIRED  # Strict for production
            
            connect_args["ssl"] = ssl_context
    else:
        print(f"🏠 Detected local database ({host}), SSL disabled")
    
    return clean_url, connect_args

# Prepare database configuration
DATABASE_URL, connect_args = prepare_database_config()

if not DATABASE_URL:
    DATABASE_AVAILABLE = False
    engine = None
    AsyncSessionLocal = None
    Base = declarative_base()
else:
    try:
        print(f"🔌 Connecting with args: {connect_args}")
        # Create async SQLAlchemy engine with smart SSL handling
        engine = create_async_engine(
            DATABASE_URL,
            echo=True,  # Log all SQL queries for debugging
            connect_args=connect_args,
            pool_pre_ping=True
        )

        # Create async sessionmaker
        AsyncSessionLocal = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False
        )

        # Create Base class
        Base = declarative_base()

        # Do not run async test connection here; handled by /health/db endpoint
        print("✅ Async engine created (test with /health/db endpoint)")
        DATABASE_AVAILABLE = True

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("⚠️ Database not available")
        engine = None
        AsyncSessionLocal = None
        Base = declarative_base()
        DATABASE_AVAILABLE = False

async def get_db():
    """Dependency for getting async database session"""
    if not DATABASE_AVAILABLE or AsyncSessionLocal is None:
        raise HTTPException(status_code=503, detail="Database not available")
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()
