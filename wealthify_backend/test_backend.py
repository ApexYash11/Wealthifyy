import psycopg2
import os

DATABASE_URL = os.getenv("DATABASE_URL")

try:
    conn = psycopg2.connect(DATABASE_URL)
    print("✅ Connected to Supabase Postgres")
except Exception as e:
    print("❌ DB Connection failed:", e)
