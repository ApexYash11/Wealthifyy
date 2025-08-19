
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException
from app.core.config import settings
import asyncio

# Get database URL from settings
DATABASE_URL = settings.DATABASE_URL

if not DATABASE_URL:
    print("❌ No DATABASE_URL found in environment variables")
    DATABASE_AVAILABLE = False
else:
    print("✅ Using DATABASE_URL from environment")

try:
    # Create async SQLAlchemy engine for Supabase pooler
    engine = create_async_engine(
        DATABASE_URL,
        echo=True,  # Log all SQL queries for debugging
        connect_args={
            "sslmode": "require",  # Force SSL connection
            "prepared_statement_cache_size": 0,  # Disable server-side prepared statements
            "timeout": 30
        }
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
