#!/usr/bin/env python3
"""
Test Supabase database connection
"""
import os
from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

# Get the current DATABASE_URL
current_url = os.getenv("DATABASE_URL")
print(f"Current DATABASE_URL: {current_url}")

# Test different Supabase connection formats
test_urls = [
    # Original from .env
    current_url,
    # Direct connection format
    "postgresql://postgres:QlLbXGoMLeNLNd2M@db.hfiwgtdfquqxwpkogojm.supabase.co:5432/postgres",
    # Pooler connection format
    "postgresql://postgres.hfiwgtdfquqxwpkogojm:QlLbXGoMLeNLNd2M@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
    # Alternative pooler format
    "postgresql://postgres.hfiwgtdfquqxwpkogojm:QlLbXGoMLeNLNd2M@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
]

for i, url in enumerate(test_urls):
    if not url:
        continue
    print(f"\n--- Testing URL {i+1} ---")
    print(f"URL: {url}")
    try:
        conn = psycopg2.connect(url)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Connection successful!")
        print(f"PostgreSQL version: {version[0]}")
        cursor.close()
        conn.close()
        print(f"🎉 This URL works! Use this format in your .env file")
        break
    except Exception as e:
        print(f"❌ Connection failed: {e}") 