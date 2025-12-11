#!/usr/bin/env python3
import uvicorn
from app.core.config import ROOT_DIR
from app.main import app

def main():
    """
    Run the FastAPI application using uvicorn
    """
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(ROOT_DIR)],
        log_level="info",
    )

if __name__ == "__main__":
    main()
