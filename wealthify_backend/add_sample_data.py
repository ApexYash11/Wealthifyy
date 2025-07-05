#!/usr/bin/env python3
"""
Script to add sample transaction data for testing the dynamic dashboard.
Run this after setting up your database and creating a user.
"""

import os
import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Add the current directory to the path so we can import our models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model import engine, User, Transaction

# Load environment variables
load_dotenv()

def add_sample_data():
    """Add sample transaction data to the database for user 'Yash Maheshwari' or 'yashmaheshwari441@gmail.com'."""
    
    # Create a session
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(
            (User.username == 'Yash Maheshwari') | (User.email == 'yashmaheshwari441@gmail.com')
        ).first()
        if not user:
            print("User 'Yash Maheshwari' or 'yashmaheshwari441@gmail.com' not found in the database. Please create this user first.")
            return
        print(f"Adding sample data for user: {user.username} (ID: {user.id}, Email: {user.email})")
        # Sample transactions data
        sample_transactions = [
            # Income transactions
            {
                "type": "income",
                "description": "Salary Deposit",
                "amount": 50000.0,
                "category": "Salary",
                "date": datetime.now().strftime("%Y-%m-%d"),
            },
            {
                "type": "income",
                "description": "Freelance Project",
                "amount": 15000.0,
                "category": "Freelance",
                "date": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d"),
            },
            # Expense transactions
            {
                "type": "expense",
                "description": "Grocery Shopping",
                "amount": 2500.0,
                "category": "Food",
                "date": datetime.now().strftime("%Y-%m-%d"),
            },
            {
                "type": "expense",
                "description": "Netflix Subscription",
                "amount": 499.0,
                "category": "Entertainment",
                "date": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
            },
            {
                "type": "expense",
                "description": "Electric Bill",
                "amount": 1200.0,
                "category": "Utilities",
                "date": (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d"),
            },
            {
                "type": "expense",
                "description": "Fuel",
                "amount": 800.0,
                "category": "Transport",
                "date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
            },
            {
                "type": "expense",
                "description": "Restaurant Dinner",
                "amount": 1200.0,
                "category": "Food",
                "date": (datetime.now() - timedelta(days=4)).strftime("%Y-%m-%d"),
            },
            {
                "type": "expense",
                "description": "Shopping - Clothes",
                "amount": 3000.0,
                "category": "Shopping",
                "date": (datetime.now() - timedelta(days=6)).strftime("%Y-%m-%d"),
            },
        ]
        # Add transactions to database
        for tx_data in sample_transactions:
            transaction = Transaction(
                user_id=user.id,
                **tx_data
            )
            db.add(transaction)
        db.commit()
        print(f"Successfully added {len(sample_transactions)} sample transactions for user '{user.username}'!")
    except Exception as e:
        print(f"Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_data() 