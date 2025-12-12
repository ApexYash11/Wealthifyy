from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_router
from app.core.database import Base, engine, DATABASE_AVAILABLE
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from sqlalchemy import text
import asyncio

# Table creation is not supported with AsyncEngine. Use Alembic for migrations.

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Wealthify - Personal Finance Management API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://wealthifyy-beta.vercel.app",  # Vercel Frontend
    "https://wealthify-production.up.railway.app" # Self (optional but good for docs)
]

# Add any origins from settings
if settings.BACKEND_CORS_ORIGINS:
    origins.extend(settings.BACKEND_CORS_ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router with prefix
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"{settings.PROJECT_NAME} API",
        "version": settings.VERSION,
        "status": "running",
        "docs_url": "/docs",
        "database": "available" if DATABASE_AVAILABLE else "unavailable"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "available" if DATABASE_AVAILABLE else "unavailable",
        "version": settings.VERSION
    }

# Force reload trigger

