#!/usr/bin/env python3
"""
Script to create a test user in the database for development/testing purposes.
"""

import sys
import os
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model import SessionLocal, User
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_test_user():
    """Create a test user in the database."""
    db = SessionLocal()
    
    try:
        # Check if test user already exists
        existing_user = db.query(User).filter(User.username == "testuser").first()
        if existing_user:
            print("✅ Test user 'testuser' already exists!")
            print(f"   Username: {existing_user.username}")
            print(f"   Email: {existing_user.email}")
            print(f"   ID: {existing_user.id}")
            return
        
        # Create test user
        test_user = User(
            username="testuser",
            email="test@wealthify.com",
            password_hash=pwd_context.hash("password123"),
            savings_goal=10000.0,
            current_savings=5000.0,
            is_admin=False,
            created_at=datetime.utcnow()
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("✅ Test user created successfully!")
        print(f"   Username: {test_user.username}")
        print(f"   Email: {test_user.email}")
        print(f"   Password: password123")
        print(f"   ID: {test_user.id}")
        print("\n🔑 You can now login with:")
        print("   Username: testuser")
        print("   Password: password123")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Creating test user for Wealthify...")
    create_test_user() 