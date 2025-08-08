#!/usr/bin/env python3
"""
Simple test to isolate startup issues
"""

import os
from dotenv import load_dotenv

print("🔍 Testing basic imports...")

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
    print("3. Testing SQLAlchemy...")
    from sqlalchemy import create_engine
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)
    print("✅ SQLAlchemy engine created successfully")
except Exception as e:
    print(f"❌ SQLAlchemy failed: {e}")

try:
    print("4. Testing model imports...")
    from model import get_db, User, Expense, Transaction, Feedback, Asset, PortfolioSnapshot
    print("✅ Model imports successful")
except Exception as e:
    print(f"❌ Model imports failed: {e}")

try:
    print("5. Testing schema imports...")
    from schema import UserCreate, Token, LoginResponse
    print("✅ Schema imports successful")
except Exception as e:
    print(f"❌ Schema imports failed: {e}")

try:
    print("6. Testing ML model imports...")
    from ml_model import predict_expense, predict_savings
    print("✅ ML model imports successful")
except Exception as e:
    print(f"❌ ML model imports failed: {e}")

try:
    print("7. Testing Supabase auth imports...")
    from supabase_auth import supabase_auth, get_current_user_supabase
    print("✅ Supabase auth imports successful")
except Exception as e:
    print(f"❌ Supabase auth imports failed: {e}")

print("\n🎯 All tests completed!") 