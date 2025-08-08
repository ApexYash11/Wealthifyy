#!/usr/bin/env python3
"""
Database Migration Script for Wealthify
Ensures existing Supabase tables work with new models
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from model import Base, User, Expense, Transaction, Feedback, Asset, PortfolioSnapshot

# Load environment variables
load_dotenv()

def migrate_database():
    """Migrate database to ensure compatibility"""
    
    # Get database URL
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        print("❌ DATABASE_URL not found in environment variables")
        return False
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            print(f"✅ Connected to database: {result.fetchone()[0]}")
        
        # Create inspector
        inspector = inspect(engine)
        
        # Check existing tables
        existing_tables = inspector.get_table_names()
        print(f"📋 Existing tables: {existing_tables}")
        
        # Define required tables and their columns
        required_tables = {
            'users': [
                'id', 'email', 'username', 'password_hash', 'savings_goal', 
                'current_savings', 'created_at', 'supabase_id', 'oauth_provider', 
                'oauth_id', 'avatar_url'
            ],
            'expenses': [
                'id', 'user_id', 'amount', 'category', 'description', 
                'date', 'month', 'created_at'
            ],
            'transactions': [
                'id', 'user_id', 'amount', 'type', 'category', 'description', 
                'date', 'created_at'
            ],
            'feedback': [
                'id', 'user_id', 'message', 'created_at'
            ],
            'assets': [
                'id', 'user_id', 'name', 'symbol', 'quantity', 'buy_price', 
                'buy_date', 'type', 'created_at'
            ],
            'portfolio_snapshots': [
                'id', 'user_id', 'value', 'timestamp'
            ]
        }
        
        # Check and create missing tables
        for table_name, required_columns in required_tables.items():
            if table_name not in existing_tables:
                print(f"📝 Creating table: {table_name}")
                # Create table using SQLAlchemy
                if table_name == 'users':
                    User.__table__.create(engine, checkfirst=True)
                elif table_name == 'expenses':
                    Expense.__table__.create(engine, checkfirst=True)
                elif table_name == 'transactions':
                    Transaction.__table__.create(engine, checkfirst=True)
                elif table_name == 'feedback':
                    Feedback.__table__.create(engine, checkfirst=True)
                elif table_name == 'assets':
                    Asset.__table__.create(engine, checkfirst=True)
                elif table_name == 'portfolio_snapshots':
                    PortfolioSnapshot.__table__.create(engine, checkfirst=True)
                print(f"✅ Created table: {table_name}")
            else:
                print(f"✅ Table exists: {table_name}")
                
                # Check columns
                existing_columns = [col['name'] for col in inspector.get_columns(table_name)]
                missing_columns = [col for col in required_columns if col not in existing_columns]
                
                if missing_columns:
                    print(f"⚠️  Missing columns in {table_name}: {missing_columns}")
                    print("   You may need to manually add these columns in Supabase dashboard")
                else:
                    print(f"✅ All required columns present in {table_name}")
        
        print("\n🎉 Database migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False

def add_sample_data():
    """Add sample data for testing"""
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        db = SessionLocal()
        
        # Check if sample user exists
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        if not existing_user:
            # Create sample user
            sample_user = User(
                email="test@example.com",
                username="testuser",
                password_hash="supabase_auth",
                savings_goal=10000.0,
                current_savings=5000.0,
                supabase_id="sample_supabase_id"
            )
            db.add(sample_user)
            db.commit()
            db.refresh(sample_user)
            print(f"✅ Created sample user with ID: {sample_user.id}")
            
            # Add sample transactions
            sample_transactions = [
                Transaction(
                    user_id=sample_user.id,
                    amount=5000.0,
                    type="income",
                    category="Salary",
                    description="Monthly salary",
                    date="2024-01-15"
                ),
                Transaction(
                    user_id=sample_user.id,
                    amount=1500.0,
                    type="expense",
                    category="Food",
                    description="Groceries",
                    date="2024-01-16"
                ),
                Transaction(
                    user_id=sample_user.id,
                    amount=800.0,
                    type="expense",
                    category="Transport",
                    description="Fuel",
                    date="2024-01-17"
                )
            ]
            
            for transaction in sample_transactions:
                db.add(transaction)
            
            db.commit()
            print("✅ Added sample transactions")
        else:
            print("✅ Sample user already exists")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Failed to add sample data: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting database migration...")
    
    if migrate_database():
        print("\n📊 Adding sample data...")
        add_sample_data()
        print("\n🎯 Migration and setup completed!")
    else:
        print("\n❌ Migration failed!") 