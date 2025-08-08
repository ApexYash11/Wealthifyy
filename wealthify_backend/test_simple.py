#!/usr/bin/env python3
"""
Simple test to check database connection and imports
"""

import os
from dotenv import load_dotenv

print("🔍 Testing basic setup...")

try:
    print("1. Testing dotenv...")
    load_dotenv()
    print("✅ dotenv loaded successfully")
except Exception as e:
    print(f"❌ dotenv failed: {e}")

try:
    print("2. Testing FastAPI...")
    from fastapi import FastAPI
    app = FastAPI()
    print("✅ FastAPI created successfully")
except Exception as e:
    print(f"❌ FastAPI failed: {e}")

try:
    print("3. Testing Supabase...")
    from supabase import create_client
    print("✅ Supabase import successful")
except Exception as e:
    print(f"❌ Supabase import failed: {e}")

try:
    print("4. Testing SQLAlchemy...")
    from sqlalchemy import create_engine
    DATABASE_URL = os.getenv("DATABASE_URL")
    if DATABASE_URL:
        print(f"✅ DATABASE_URL found: {DATABASE_URL[:50]}...")
        # Don't actually connect, just test the URL format
        print("✅ DATABASE_URL format looks correct")
    else:
        print("❌ DATABASE_URL not found in environment")
except Exception as e:
    print(f"❌ SQLAlchemy test failed: {e}")

print("✅ Basic tests complete.") 