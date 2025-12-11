#!/usr/bin/env python3
"""
Simple script to create a test user in the database.
This helps with the initial setup when the user mapping isn't working yet.
"""

import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.core.user_mapping import ensure_user_exists

# User data extracted from the logs
TEST_USER_DATA = {
    "id": "67855f40-4da9-41bc-b9b0-aa4edb66bbbd",
    "email": "yashmaheshwari8983@gmail.com", 
    "user_metadata": {
        "name": "yash Maheshwari",
        "full_name": "yash Maheshwari",
        "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocK291vHTTkDSyXDibpQUqOwFSlyzf_Ufa8gunkzDX2N8AbzJA=s96-c",
        "provider_id": "104451579479964526408"
    },
    "app_metadata": {
        "provider": "google"
    }
}

async def create_user():
    """Create the test user in the database"""
    
    if not AsyncSessionLocal:
        print("❌ Database not available. Check your DATABASE_URL.")
        return False
        
    async with AsyncSessionLocal() as db:
        try:
            print(f"🔍 Checking if user exists: {TEST_USER_DATA['email']}")
            
            user_id = await ensure_user_exists(TEST_USER_DATA, db)
            
            if user_id:
                print(f"✅ User created/found with ID: {user_id}")
                print(f"📧 Email: {TEST_USER_DATA['email']}")
                print(f"🆔 Supabase UUID: {TEST_USER_DATA['id']}")
                return True
            else:
                print("❌ Failed to create user")
                return False
                
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return False

if __name__ == "__main__":
    print("🚀 Creating test user for Wealthify...")
    success = asyncio.run(create_user())
    
    if success:
        print("✅ User creation completed successfully!")
        print("🎯 You can now test the API endpoints.")
    else:
        print("❌ User creation failed. Check the logs above.")
        sys.exit(1)
