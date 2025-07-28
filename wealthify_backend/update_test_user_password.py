#!/usr/bin/env python3
"""
Script to update the test user's password hash to the correct one.
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

def update_test_user_password():
    """Update the test user's password hash."""
    
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
        
        # Update password hash
        new_password = "testpass123"
        new_hash = pwd_context.hash(new_password)
        
        user.password_hash = new_hash
        db.commit()
        
        print(f"✅ Updated password hash for user: {user.username}")
        print(f"New hash: {new_hash}")
        
        # Verify the new hash
        is_valid = pwd_context.verify(new_password, new_hash)
        print(f"Password verification: {'✅ Valid' if is_valid else '❌ Invalid'}")
        
        return True
        
    except Exception as e:
        print(f"Error updating user password: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    update_test_user_password() 