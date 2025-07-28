import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/wealthify")

def check_expense_data():
    """Check what expense data exists in the database"""
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Check expenses table
            print("=== EXPENSES TABLE DATA ===")
            result = conn.execute(text("SELECT * FROM expenses ORDER BY month DESC LIMIT 10"))
            rows = result.fetchall()
            
            if rows:
                print(f"Found {len(rows)} expense records:")
                for row in rows:
                    print(f"User ID: {row[0]}, Month: {row[1]}, Total: {row[2]}")
                    print(f"  Rent: {row[3]}, Loan: {row[4]}, Insurance: {row[5]}")
                    print(f"  Groceries: {row[6]}, Transport: {row[7]}, Eating Out: {row[8]}")
                    print(f"  Entertainment: {row[9]}, Utilities: {row[10]}, Healthcare: {row[11]}")
                    print(f"  Education: {row[12]}, Misc: {row[13]}")
                    print("---")
            else:
                print("No expense data found!")
            
            # Check transactions table
            print("\n=== TRANSACTIONS TABLE DATA ===")
            result = conn.execute(text("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10"))
            rows = result.fetchall()
            
            if rows:
                print(f"Found {len(rows)} transaction records:")
                for row in rows:
                    print(f"User ID: {row[1]}, Type: {row[2]}, Amount: {row[3]}, Category: {row[4]}")
            else:
                print("No transaction data found!")
                
    except Exception as e:
        print(f"❌ Error checking data: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Checking expense and transaction data...")
    check_expense_data() 