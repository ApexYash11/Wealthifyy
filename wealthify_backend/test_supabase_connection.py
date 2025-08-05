import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_supabase_connection():
    """Test connection to Supabase database"""
    try:
        # Get DATABASE_URL from environment
        database_url = os.getenv('DATABASE_URL')
        print(f"Testing connection to: {database_url}")
        
        if not database_url:
            print("No DATABASE_URL found in environment variables")
            return False
            
        # Test connection
        conn = psycopg2.connect(database_url)
        print("Successfully connected to Supabase database!")
        
        # Test a simple query
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"Database version: {version[0]}")
        
        # Test if users table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        """)
        table_exists = cursor.fetchone()[0]
        print(f"Users table exists: {table_exists}")
        
        if table_exists:
            # Count users
            cursor.execute("SELECT COUNT(*) FROM users;")
            user_count = cursor.fetchone()[0]
            print(f"Total users in database: {user_count}")
        
        cursor.close()
        conn.close()
        print("Database connection test completed successfully!")
        return True
        
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

if __name__ == "__main__":
    test_supabase_connection() 