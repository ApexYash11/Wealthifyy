#!/usr/bin/env python3
"""
Wealthify Backend Startup Script
Handles environment setup and server startup
"""

import os
import sys
import subprocess
import uvicorn
from pathlib import Path

def check_environment():
    """Check if required environment variables are set"""
    required_vars = [
        'SECRET_KEY',
        'DATABASE_URL',
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n📝 Please create a .env file based on env-template.txt")
        return False
    
    print("✅ Environment variables check passed")
    return True

def install_dependencies():
    """Install Python dependencies"""
    try:
        print("📦 Installing dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def create_database():
    """Create database tables if they don't exist"""
    try:
        print("🗄️  Setting up database...")
        from model import Base, engine
        Base.metadata.create_all(bind=engine)
        print("✅ Database setup completed")
        return True
    except Exception as e:
        print(f"⚠️  Database setup warning: {e}")
        print("   Continuing with mock database mode...")
        return True

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting Wealthify Backend Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔧 Health Check: http://localhost:8000/health")
    print("\n" + "="*50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

def main():
    """Main startup function"""
    print("🎯 Wealthify Backend Startup")
    print("="*50)
    
    # Check if we're in the right directory
    if not Path("main.py").exists():
        print("❌ Please run this script from the wealthify_backend directory")
        sys.exit(1)
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Setup database
    create_database()
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
