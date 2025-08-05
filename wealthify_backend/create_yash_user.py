#!/usr/bin/env python3
"""
Script to create Yash user in the SQLite database
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

def create_yash_user():
    """Create Yash user in the database."""
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == "Yash").first()
        if existing_user:
            print("✅ User 'Yash' already exists!")
            print(f"   Username: {existing_user.username}")
            print(f"   Email: {existing_user.email}")
            print(f"   ID: {existing_user.id}")
            return
        
        # Create Yash user
        yash_user = User(
            username="Yash",
            email="yashmaheshwari8983@gmail.com",
            password_hash=pwd_context.hash("Yash#8983"),
            savings_goal=10000.0,
            current_savings=5000.0,
            is_admin=False,
            created_at=datetime.utcnow()
        )
        
        db.add(yash_user)
        db.commit()
        db.refresh(yash_user)
        
        print("✅ Yash user created successfully!")
        print(f"   Username: {yash_user.username}")
        print(f"   Email: {yash_user.email}")
        print(f"   Password: Yash#8983")
        print(f"   ID: {yash_user.id}")
        print("\n🔑 You can now login with:")
        print("   Username: Yash")
        print("   Password: Yash#8983")
        
    except Exception as e:
        print(f"❌ Error creating Yash user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Creating Yash user for Wealthify...")
    create_yash_user() 