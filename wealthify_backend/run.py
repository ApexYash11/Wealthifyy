#!/usr/bin/env python3
import os
import uvicorn
from app.core.config import ROOT_DIR
from app.main import app

def main():
    """
    Run the FastAPI application using uvicorn
    """
    # Use reload only in development, not in production
    reload_enabled = os.getenv("ENVIRONMENT", "development").lower() in ["development", "dev", "local"]
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=reload_enabled,
        reload_dirs=[str(ROOT_DIR)] if reload_enabled else None,
        log_level="info",
    )

if __name__ == "__main__":
    main()
