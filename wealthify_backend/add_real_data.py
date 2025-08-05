import os
import psycopg2
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random

# Load environment variables
load_dotenv()

def add_real_data_for_user():
    """Add real transaction data for testing"""
    try:
        # Get DATABASE_URL from environment
        database_url = os.getenv('DATABASE_URL')
        print(f"🔗 Connecting to: {database_url}")
        
        if not database_url:
            print("❌ No DATABASE_URL found")
            return
            
        # Connect to database
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Find user with username 'Yash' or 'testuser'
        cursor.execute("SELECT id, username FROM users WHERE username ILIKE '%yash%' OR username ILIKE '%test%' LIMIT 1;")
        user_result = cursor.fetchone()
        
        if not user_result:
            print("❌ No user found with 'Yash' or 'test' in username")
            return
            
        user_id, username = user_result
        print(f"✅ Found user: {username} (ID: {user_id})")
        
        # Sample real transaction data
        transactions = [
            # Income
            (user_id, 'income', 'Monthly Salary', 75000, 'Salary', '2025-08-01'),
            (user_id, 'income', 'Freelance Project', 15000, 'Freelance', '2025-08-15'),
            
            # Expenses
            (user_id, 'expense', 'Monthly Rent', 25000, 'Housing', '2025-08-01'),
            (user_id, 'expense', 'Internet Bill', 1500, 'Utilities', '2025-08-05'),
            (user_id, 'expense', 'Electricity Bill', 2000, 'Utilities', '2025-08-10'),
            (user_id, 'expense', 'Grocery Shopping', 8000, 'Food', '2025-08-12'),
            (user_id, 'expense', 'Fuel', 3000, 'Transportation', '2025-08-14'),
            (user_id, 'expense', 'Netflix Subscription', 499, 'Entertainment', '2025-08-15'),
            (user_id, 'expense', 'Gym Membership', 1200, 'Health', '2025-08-16'),
            (user_id, 'expense', 'Shopping - Clothes', 5000, 'Shopping', '2025-08-18'),
            (user_id, 'expense', 'Restaurant Dinner', 2500, 'Food', '2025-08-20'),
            (user_id, 'expense', 'Movie Tickets', 800, 'Entertainment', '2025-08-22'),
            (user_id, 'expense', 'Medical Checkup', 3000, 'Healthcare', '2025-08-25'),
            (user_id, 'expense', 'Books', 1500, 'Education', '2025-08-28'),
        ]
        
        # Add transactions
        print(f"\n💰 Adding {len(transactions)} transactions...")
        for tx in transactions:
            cursor.execute("""
                INSERT INTO transactions (user_id, type, description, amount, category, date, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (*tx, datetime.now().isoformat()))
        
        # Add some assets
        assets = [
            (user_id, 'Bitcoin', 'BTC', 0.5, 45000, 'crypto'),
            (user_id, 'Ethereum', 'ETH', 2.0, 2800, 'crypto'),
            (user_id, 'Reliance Industries', 'RELIANCE', 10, 2500, 'stock'),
            (user_id, 'HDFC Bank', 'HDFCBANK', 5, 1800, 'stock'),
        ]
        
        print(f"📈 Adding {len(assets)} assets...")
        for asset in assets:
            cursor.execute("""
                INSERT INTO assets (user_id, name, symbol, quantity, buy_price, type, buy_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (*asset, datetime.now()))
        
        # Update user's savings goal and current savings
        cursor.execute("""
            UPDATE users 
            SET savings_goal = 100000, current_savings = 25000 
            WHERE id = %s
        """, (user_id,))
        
        conn.commit()
        print("✅ Real data added successfully!")
        
        # Show summary
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE user_id = %s", (user_id,))
        tx_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM assets WHERE user_id = %s", (user_id,))
        asset_count = cursor.fetchone()[0]
        
        print(f"\n📊 Summary for user {username}:")
        print(f"  - Transactions: {tx_count}")
        print(f"  - Assets: {asset_count}")
        print(f"  - Savings Goal: ₹100,000")
        print(f"  - Current Savings: ₹25,000")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_real_data_for_user() 