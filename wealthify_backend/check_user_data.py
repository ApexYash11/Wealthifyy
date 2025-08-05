import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_user_data():
    """Check actual data in the database for users"""
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
        
        print("\n📊 DATABASE ANALYSIS:")
        print("=" * 50)
        
        # Check users table
        cursor.execute("SELECT COUNT(*) FROM users;")
        user_count = cursor.fetchone()[0]
        print(f"👥 Total users: {user_count}")
        
        # Check specific users
        cursor.execute("SELECT id, username, email, savings_goal, current_savings FROM users LIMIT 5;")
        users = cursor.fetchall()
        print(f"\n👤 Sample users:")
        for user in users:
            print(f"  ID: {user[0]}, Username: {user[1]}, Email: {user[2]}")
            print(f"     Savings Goal: ₹{user[3] or 0}, Current Savings: ₹{user[4] or 0}")
        
        # Check transactions
        cursor.execute("SELECT COUNT(*) FROM transactions;")
        transaction_count = cursor.fetchone()[0]
        print(f"\n💰 Total transactions: {transaction_count}")
        
        if transaction_count > 0:
            cursor.execute("""
                SELECT user_id, type, description, amount, category, date 
                FROM transactions 
                ORDER BY date DESC 
                LIMIT 10;
            """)
            transactions = cursor.fetchall()
            print(f"\n📈 Recent transactions:")
            for tx in transactions:
                print(f"  User {tx[0]}: {tx[1]} - {tx[2]} (₹{tx[3]}) - {tx[4]} - {tx[5]}")
        
        # Check expenses
        cursor.execute("SELECT COUNT(*) FROM expenses;")
        expense_count = cursor.fetchone()[0]
        print(f"\n📊 Total expenses: {expense_count}")
        
        if expense_count > 0:
            cursor.execute("""
                SELECT user_id, month, total_expense 
                FROM expenses 
                ORDER BY month DESC 
                LIMIT 5;
            """)
            expenses = cursor.fetchall()
            print(f"\n💸 Recent expenses:")
            for exp in expenses:
                print(f"  User {exp[0]}: {exp[1]} - ₹{exp[2]}")
        
        # Check assets
        cursor.execute("SELECT COUNT(*) FROM assets;")
        asset_count = cursor.fetchone()[0]
        print(f"\n📈 Total assets: {asset_count}")
        
        if asset_count > 0:
            cursor.execute("""
                SELECT user_id, name, symbol, quantity, buy_price, type 
                FROM assets 
                LIMIT 5;
            """)
            assets = cursor.fetchall()
            print(f"\n🏦 Sample assets:")
            for asset in assets:
                print(f"  User {asset[0]}: {asset[1]} ({asset[2]}) - {asset[3]} units @ ₹{asset[4]} - {asset[5]}")
        
        cursor.close()
        conn.close()
        print("\n✅ Database analysis completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_user_data() 