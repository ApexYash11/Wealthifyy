#!/usr/bin/env python3
"""
Test Supabase connection with SSL
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

project_id = "hfiwgtdfquqxwpkogojm"
password = "QlLbXGoMLeNLNd2M"

# Test with SSL parameters
test_connections = [
    # Direct connection with SSL
    f"postgresql://postgres:{password}@{project_id}.supabase.co:5432/postgres?sslmode=require",
    
    # Direct connection with SSL and other parameters
    f"postgresql://postgres:{password}@{project_id}.supabase.co:5432/postgres?sslmode=require&connect_timeout=10",
    
    # Pooler connection with SSL
    f"postgresql://postgres.{project_id}:{password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require",
]

for i, conn_str in enumerate(test_connections, 1):
    print(f"\n--- Test {i} ---")
    print(f"Connection string: {conn_str}")
    
    try:
        # Try with explicit SSL parameters
        conn = psycopg2.connect(
            conn_str,
            sslmode='require',
            connect_timeout=10
        )
        cursor = conn.cursor()
        cursor.execute("SELECT current_database(), current_user;")
        result = cursor.fetchone()
        print(f"✅ SUCCESS! Connected to database: {result[0]}, user: {result[1]}")
        cursor.close()
        conn.close()
        
        print(f"🎉 WORKING CONNECTION STRING: {conn_str}")
        break
        
    except Exception as e:
        print(f"❌ Failed: {str(e)[:100]}...")

print("\n" + "="*50)
print("If still failing, the issue might be:")
print("1. IP address not whitelisted in Supabase")
print("2. Wrong password")
print("3. Database not accessible from your network")




