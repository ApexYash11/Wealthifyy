import os
import psycopg2
import requests
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ENV variables
DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def test_postgres_connection():
    print("🔁 Testing PostgreSQL connection...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        db_version = cursor.fetchone()
        print(f"✅ PostgreSQL connected: {db_version[0]}")
        conn.close()
    except Exception as e:
        print("❌ PostgreSQL connection failed:", e)

def test_supabase_api():
    print("\n🔁 Testing Supabase REST API (table: users)...")
    table_name = "users"  # ✅ your actual table

    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            print("✅ Supabase API connected.")
            data = response.json()
            if data:
                print(f"📦 Fetched {len(data)} rows from 'users' table.")
                print("🔍 Sample row:", data[0])
            else:
                print("📭 'users' table is empty.")
        else:
            print(f"❌ Supabase API error: {response.status_code} - {response.text}")
    except Exception as e:
        print("❌ Supabase API request failed:", e)

if __name__ == "__main__":
    test_postgres_connection()
    test_supabase_api()
