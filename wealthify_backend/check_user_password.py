#!/usr/bin/env python3
"""
Script to check user password hash and verify authentication.
"""

import os
import sys
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from dotenv import load_dotenv
from passlib.context import CryptContext

# Add the current directory to the path so we can import our models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model import engine, User

# Load environment variables
load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def check_user_password():
    """Check the test user's password hash and verify it."""
    
    # Create a session
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Find the test user
        user = db.query(User).filter(User.username == "testuser").first()
        if not user:
            print("❌ Test user not found")
            return
        
        print(f"✅ Found test user: {user.username} (ID: {user.id})")
        print(f"Email: {user.email}")
        print(f"Password hash: {user.password_hash}")
        
        # Test password verification
        test_password = "testpass123"
        is_valid = pwd_context.verify(test_password, user.password_hash)
        
        print(f"Password verification for '{test_password}': {'✅ Valid' if is_valid else '❌ Invalid'}")
        
        # Generate a new hash for comparison
        new_hash = pwd_context.hash(test_password)
        print(f"New hash for '{test_password}': {new_hash}")
        
        # Test the new hash
        is_new_valid = pwd_context.verify(test_password, new_hash)
        print(f"New hash verification: {'✅ Valid' if is_new_valid else '❌ Invalid'}")
        
        return is_valid
        
    except Exception as e:
        print(f"Error checking user password: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    check_user_password() 