#!/usr/bin/env python3
"""
Find the correct Supabase database connection string
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Get the project ID from the SUPABASE_URL
supabase_url = os.getenv("SUPABASE_URL")
project_id = "hfiwgtdfquqxwpkogojm"  # From the URL
password = "QlLbXGoMLeNLNd2M"  # From .env

print(f"Project ID: {project_id}")
print(f"Password: {password}")

# Test different connection formats
test_connections = [
    # Format 1: Direct connection
    f"postgresql://postgres:{password}@db.{project_id}.supabase.co:5432/postgres",
    
    # Format 2: Pooler connection with postgres prefix
    f"postgresql://postgres.{project_id}:{password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
    
    # Format 3: Pooler connection without postgres prefix
    f"postgresql://{project_id}:{password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
    
    # Format 4: Pooler connection with different username format
    f"postgresql://postgres:{password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
    
    # Format 5: Direct connection with different host
    f"postgresql://postgres:{password}@{project_id}.supabase.co:5432/postgres",
]

for i, conn_str in enumerate(test_connections, 1):
    print(f"\n--- Test {i} ---")
    print(f"Connection string: {conn_str}")
    
    try:
        conn = psycopg2.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("SELECT current_database(), current_user;")
        result = cursor.fetchone()
        print(f"✅ SUCCESS! Connected to database: {result[0]}, user: {result[1]}")
        cursor.close()
        conn.close()
        
        print(f"🎉 WORKING CONNECTION STRING: {conn_str}")
        print("Use this format in your .env file!")
        break
        
    except Exception as e:
        print(f"❌ Failed: {str(e)[:100]}...")

print("\n" + "="*50)
print("If none of the above work, please check:")
print("1. Your Supabase project settings")
print("2. The correct password in your .env file")
print("3. Whether your IP is whitelisted in Supabase")




