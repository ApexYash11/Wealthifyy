from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.auth.auth_router import router as auth_router
from src.utils.error_handler import error_handler
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Wealthify API",
    description="Financial management and insights API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add error handler
app.middleware("http")(error_handler)

# Include routers
app.include_router(auth_router)

@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Welcome to Wealthify API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "version": "1.0.0"
    }
