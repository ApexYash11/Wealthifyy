#!/usr/bin/env python3
"""
Test script for Supabase integration
Run this script to verify that Supabase Auth and database connection are working correctly.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_environment_variables():
    """Test if all required environment variables are set"""
    print("🔍 Testing environment variables...")
    
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY", 
        "DATABASE_URL"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please check your .env file and ensure all required variables are set.")
        return False
    
    print("✅ All required environment variables are set")
    return True

def test_supabase_connection():
    """Test Supabase client connection"""
    print("\n🔍 Testing Supabase connection...")
    
    try:
        from supabase import create_client
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        supabase = create_client(supabase_url, supabase_key)
        
        # Test a simple query to verify connection
        response = supabase.table("users").select("count", count="exact").limit(1).execute()
        
        print("✅ Supabase connection successful")
        return True
        
    except Exception as e:
        print(f"❌ Supabase connection failed: {str(e)}")
        return False

def test_database_connection():
    """Test database connection"""
    print("\n🔍 Testing database connection...")
    
    try:
        from sqlalchemy import create_engine
        from sqlalchemy.exc import SQLAlchemyError
        
        database_url = os.getenv("DATABASE_URL")
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as connection:
            result = connection.execute("SELECT 1")
            result.fetchone()
        
        print("✅ Database connection successful")
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False

def test_supabase_auth():
    """Test Supabase Auth functionality"""
    print("\n🔍 Testing Supabase Auth...")
    
    try:
        from supabase_auth import supabase_auth
        
        # Test if supabase_auth is properly initialized
        if supabase_auth and supabase_auth.supabase:
            print("✅ Supabase Auth initialized successfully")
            return True
        else:
            print("❌ Supabase Auth not properly initialized")
            return False
            
    except Exception as e:
        print(f"❌ Supabase Auth test failed: {str(e)}")
        return False

def test_model_imports():
    """Test if all models can be imported"""
    print("\n🔍 Testing model imports...")
    
    try:
        from model import User, Expense, Transaction, Asset, PortfolioSnapshot, Feedback
        print("✅ All models imported successfully")
        return True
        
    except Exception as e:
        print(f"❌ Model import failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Supabase integration tests...\n")
    
    tests = [
        test_environment_variables,
        test_supabase_connection,
        test_database_connection,
        test_supabase_auth,
        test_model_imports
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Supabase integration is ready.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 