#!/usr/bin/env python3
"""
Fix DATABASE_URL by properly URL-encoding the password
"""

import urllib.parse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def fix_database_url():
    """Fix the DATABASE_URL by properly encoding the password"""
    
    # Get current DATABASE_URL
    current_url = os.getenv('DATABASE_URL')
    print(f"Current DATABASE_URL: {current_url}")
    
    # Parse the URL to extract components
    try:
        # Find the password by looking for the pattern postgresql://postgres:PASSWORD@
        start = current_url.find('postgresql://postgres:') + len('postgresql://postgres:')
        end = current_url.rfind('@')
        
        if start == -1 or end == -1 or start >= end:
            print("❌ Invalid DATABASE_URL format")
            return None
            
        # Extract the password
        password = current_url[start:end]
        
        # URL-encode the password
        encoded_password = urllib.parse.quote(password)
        print(f"Original password: {password}")
        print(f"Encoded password: {encoded_password}")
        
        # Reconstruct the URL
        host_part = current_url[end+1:]  # Everything after the last @
        fixed_url = f"postgresql://postgres:{encoded_password}@{host_part}"
        print(f"Fixed DATABASE_URL: {fixed_url}")
        
        return fixed_url
        
    except Exception as e:
        print(f"❌ Error fixing DATABASE_URL: {e}")
        return None

if __name__ == "__main__":
    print("🔧 Fixing DATABASE_URL...")
    fixed_url = fix_database_url()
    
    if fixed_url:
        print("\n✅ Fixed DATABASE_URL generated!")
        print("Please update your .env file with this URL:")
        print(f"DATABASE_URL={fixed_url}")
    else:
        print("\n❌ Failed to fix DATABASE_URL") 