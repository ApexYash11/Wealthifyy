import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def add_oauth_columns():
    """Add OAuth columns to users table"""
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL not set")
    
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Add OAuth columns
        columns_to_add = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR"
        ]
        
        for column_sql in columns_to_add:
            cursor.execute(column_sql)
            print(f"✅ Executed: {column_sql}")
        
        # Make username and password_hash nullable for OAuth users
        cursor.execute("ALTER TABLE users ALTER COLUMN username DROP NOT NULL")
        cursor.execute("ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL")
        print("✅ Made username and password_hash nullable")
        
        # Commit changes
        conn.commit()
        print("✅ OAuth columns added successfully!")
        
    except Exception as e:
        print(f"❌ Error adding OAuth columns: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    add_oauth_columns() 