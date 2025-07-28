#!/usr/bin/env python3
"""
Script to create a test user with a known password for testing.
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

def create_test_user():
    """Create a test user with a known password."""
    
    # Create a session
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if test user already exists
        existing_user = db.query(User).filter(User.username == "testuser").first()
        if existing_user:
            print(f"Test user already exists: {existing_user.username} (ID: {existing_user.id})")
            return existing_user.id
        
        # Create new test user
        test_user = User(
            username="testuser",
            email="test@example.com",
            password_hash=pwd_context.hash("testpass123")
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print(f"✅ Test user created successfully!")
        print(f"Username: {test_user.username}")
        print(f"Email: {test_user.email}")
        print(f"ID: {test_user.id}")
        print(f"Password: testpass123")
        
        return test_user.id
        
    except Exception as e:
        print(f"Error creating test user: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user() 