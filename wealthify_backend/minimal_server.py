#!/usr/bin/env python3
"""
Minimal FastAPI server for testing
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Wealthify API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Wealthify API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database_connected": False,
        "message": "Server running without database connection"
    }

@app.post("/auth/supabase/verify")
async def verify_supabase_token():
    """Mock OAuth verification endpoint"""
    return {
        "valid": True,
        "user": {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
            "supabase_id": "test-supabase-id",
            "oauth_provider": "google"
        }
    }

@app.get("/test")
async def test_endpoint():
    """Test endpoint"""
    return {"message": "Test endpoint working"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting minimal Wealthify server...")
    print("📡 Server will run on http://localhost:8000")
    print("🔗 Health check: http://localhost:8000/health")
    uvicorn.run(app, host="0.0.0.0", port=8000) 