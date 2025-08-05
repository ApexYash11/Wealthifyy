#!/usr/bin/env python3
"""
Script to reset password for the Yash user account
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

def reset_user_password():
    """Reset password for Yash user account."""
    db = SessionLocal()
    
    try:
        # Find the user by username (try both cases)
        user = db.query(User).filter(User.username == "Yash").first()
        if not user:
            user = db.query(User).filter(User.username == "yash").first()
        
        if not user:
            print("❌ User 'Yash' not found in database!")
            return
        
        # Reset password to Yash#8983
        new_password = "Yash#8983"
        user.password_hash = pwd_context.hash(new_password)
        
        db.commit()
        
        print("✅ Password reset successfully!")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   New Password: {new_password}")
        print(f"   ID: {user.id}")
        
    except Exception as e:
        print(f"❌ Error resetting password: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Resetting password for Yash user...")
    reset_user_password() 