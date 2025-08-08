#!/usr/bin/env python3
"""
Database Analysis Script for Wealthify
Shows current database structure and sample data
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from model import User, Expense, Transaction, Feedback, Asset, PortfolioSnapshot

# Load environment variables
load_dotenv()

def analyze_database():
    """Analyze the current database structure and data"""
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        print("❌ DATABASE_URL not found")
        return
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            print(f"✅ Connected to: {result.fetchone()[0]}")
        
        # Create inspector
        inspector = inspect(engine)
        
        # Get all tables
        tables = inspector.get_table_names()
        print(f"\n📋 Database Tables: {tables}")
        
        # Analyze each table
        for table_name in tables:
            print(f"\n🔍 Analyzing Table: {table_name}")
            print("=" * 50)
            
            # Get columns
            columns = inspector.get_columns(table_name)
            print("📊 Columns:")
            for col in columns:
                print(f"  - {col['name']}: {col['type']} (nullable: {col['nullable']})")
            
            # Get sample data
            try:
                with engine.connect() as conn:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                    count = result.fetchone()[0]
                    print(f"📈 Total Records: {count}")
                    
                    if count > 0:
                        # Get sample data
                        result = conn.execute(text(f"SELECT * FROM {table_name} LIMIT 3"))
                        rows = result.fetchall()
                        print("📄 Sample Data:")
                        for i, row in enumerate(rows, 1):
                            print(f"  Row {i}: {dict(row._mapping)}")
                    else:
                        print("📄 No data found")
                        
            except Exception as e:
                print(f"❌ Error reading data: {e}")
        
        # Show relationships
        print(f"\n🔗 Database Relationships:")
        print("=" * 50)
        print("Users -> Assets (one-to-many)")
        print("Users -> Transactions (one-to-many)")
        print("Users -> Expenses (one-to-many)")
        print("Users -> Feedback (one-to-many)")
        print("Users -> PortfolioSnapshots (one-to-many)")
        
        # Show data flow
        print(f"\n🔄 Data Flow:")
        print("=" * 50)
        print("1. User Registration -> Users table")
        print("2. User Login -> Supabase Auth + Users table sync")
        print("3. Expense Tracking -> Expenses table (monthly categories)")
        print("4. Transaction Tracking -> Transactions table (individual transactions)")
        print("5. Asset Management -> Assets table (crypto, stocks, etc.)")
        print("6. Portfolio Tracking -> PortfolioSnapshots table (daily values)")
        print("7. Feedback -> Feedback table (user feedback)")
        
        # Show what's stored in each table
        print(f"\n💾 What's Stored in Each Table:")
        print("=" * 50)
        
        print("\n👤 Users Table:")
        print("  - Basic info: id, username, email, password_hash")
        print("  - Financial goals: savings_goal, current_savings")
        print("  - Supabase integration: supabase_id, oauth_provider, oauth_id, avatar_url")
        print("  - Admin status: is_admin")
        print("  - Timestamps: created_at")
        
        print("\n💰 Expenses Table:")
        print("  - Monthly expense categories: rent, loan_repayment, insurance, groceries, etc.")
        print("  - Total expense per month")
        print("  - User association: user_id")
        print("  - Time period: month (format: 'Jan-2024')")
        
        print("\n💳 Transactions Table:")
        print("  - Individual transactions: type (income/expense), amount, category, description")
        print("  - Date tracking: date, created_at")
        print("  - Recurring flag: recurring")
        print("  - User association: user_id")
        
        print("\n📈 Assets Table:")
        print("  - Asset details: name, symbol, quantity, buy_price, buy_date")
        print("  - Asset type: type (crypto, stock, etc.)")
        print("  - User association: user_id")
        
        print("\n📊 PortfolioSnapshots Table:")
        print("  - Portfolio value at specific time: value, timestamp")
        print("  - User association: user_id")
        print("  - Used for tracking portfolio performance over time")
        
        print("\n💬 Feedback Table:")
        print("  - User feedback: message")
        print("  - User association: user_id")
        print("  - Timestamp: created_at")
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")

if __name__ == "__main__":
    print("🔍 Analyzing Wealthify Database...")
    analyze_database() 