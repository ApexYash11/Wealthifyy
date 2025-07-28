import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/wealthify")

def add_current_savings_column():
    """Add current_savings column to users table if it doesn't exist"""
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'current_savings'
            """))
            
            if not result.fetchone():
                print("Adding current_savings column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN current_savings FLOAT DEFAULT 0.0"))
                conn.commit()
                print("✅ current_savings column added successfully!")
            else:
                print("✅ current_savings column already exists!")
                
    except Exception as e:
        print(f"❌ Error adding column: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Adding current_savings column to database...")
    success = add_current_savings_column()
    if success:
        print("Database migration completed successfully!")
    else:
        print("Database migration failed!")
        sys.exit(1) 