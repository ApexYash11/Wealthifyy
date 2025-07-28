#!/usr/bin/env python3
"""
Script to add sample expense data for testing the ML prediction models.
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

from model import engine, User, Expense

# Load environment variables
load_dotenv()

def add_expense_data():
    """Add sample expense data to the database for the specified user."""
    
    # Create a session
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Get user from environment variables or use defaults
        target_username = os.getenv("TARGET_USERNAME", "testuser")
        target_email = os.getenv("TARGET_EMAIL", "test@example.com")
        
        user = db.query(User).filter(
            (User.username == target_username) | (User.email == target_email)
        ).first()
        
        if not user:
            print(f"User '{target_username}' or '{target_email}' not found in the database.")
            print("Please create this user first or set TARGET_USERNAME/TARGET_EMAIL environment variables.")
            return
            
        print(f"Adding sample expense data for user: {user.username} (ID: {user.id}, Email: {user.email})")
        
        # Sample expense data for the last 6 months
        sample_expenses = [
            # January 2025
            {
                "month": "Jan-2025",
                "rent": 15000.0,
                "loan_repayment": 8000.0,
                "insurance": 2000.0,
                "groceries": 5000.0,
                "transport": 3000.0,
                "eating_out": 4000.0,
                "entertainment": 2000.0,
                "utilities": 2500.0,
                "healthcare": 1500.0,
                "education": 3000.0,
                "miscellaneous": 2000.0,
                "total_expense": 48000.0,
            },
            # February 2025
            {
                "month": "Feb-2025",
                "rent": 15000.0,
                "loan_repayment": 8000.0,
                "insurance": 2000.0,
                "groceries": 4500.0,
                "transport": 2800.0,
                "eating_out": 3500.0,
                "entertainment": 1800.0,
                "utilities": 2400.0,
                "healthcare": 1200.0,
                "education": 3000.0,
                "miscellaneous": 1800.0,
                "total_expense": 46000.0,
            },
            # March 2025
            {
                "month": "Mar-2025",
                "rent": 15000.0,
                "loan_repayment": 8000.0,
                "insurance": 2000.0,
                "groceries": 4800.0,
                "transport": 3200.0,
                "eating_out": 4200.0,
                "entertainment": 2200.0,
                "utilities": 2600.0,
                "healthcare": 1800.0,
                "education": 3000.0,
                "miscellaneous": 2200.0,
                "total_expense": 50000.0,
            },
            # April 2025
            {
                "month": "Apr-2025",
                "rent": 15000.0,
                "loan_repayment": 8000.0,
                "insurance": 2000.0,
                "groceries": 5200.0,
                "transport": 3500.0,
                "eating_out": 4500.0,
                "entertainment": 2500.0,
                "utilities": 2800.0,
                "healthcare": 2000.0,
                "education": 3000.0,
                "miscellaneous": 2500.0,
                "total_expense": 52000.0,
            },
            # May 2025
            {
                "month": "May-2025",
                "rent": 15000.0,
                "loan_repayment": 8000.0,
                "insurance": 2000.0,
                "groceries": 5500.0,
                "transport": 3800.0,
                "eating_out": 4800.0,
                "entertainment": 2800.0,
                "utilities": 3000.0,
                "healthcare": 2200.0,
                "education": 3000.0,
                "miscellaneous": 2800.0,
                "total_expense": 54000.0,
            },
            # June 2025
            {
                "month": "Jun-2025",
                "rent": 15000.0,
                "loan_repayment": 8000.0,
                "insurance": 2000.0,
                "groceries": 5800.0,
                "transport": 4000.0,
                "eating_out": 5000.0,
                "entertainment": 3000.0,
                "utilities": 3200.0,
                "healthcare": 2400.0,
                "education": 3000.0,
                "miscellaneous": 3000.0,
                "total_expense": 56000.0,
            },
        ]
        
        # Check if data already exists for this user
        existing_expenses = db.query(Expense).filter(Expense.user_id == user.id).count()
        if existing_expenses > 0:
            print(f"User already has {existing_expenses} expense records. Skipping data addition.")
            return
        
        # Add expense data
        for expense_data in sample_expenses:
            expense = Expense(
                user_id=user.id,
                month=expense_data["month"],
                rent=expense_data["rent"],
                loan_repayment=expense_data["loan_repayment"],
                insurance=expense_data["insurance"],
                groceries=expense_data["groceries"],
                transport=expense_data["transport"],
                eating_out=expense_data["eating_out"],
                entertainment=expense_data["entertainment"],
                utilities=expense_data["utilities"],
                healthcare=expense_data["healthcare"],
                education=expense_data["education"],
                miscellaneous=expense_data["miscellaneous"],
                total_expense=expense_data["total_expense"],
            )
            db.add(expense)
        
        db.commit()
        print(f"✅ Successfully added {len(sample_expenses)} months of expense data for user {user.username}")
        
    except Exception as e:
        print(f"❌ Error adding expense data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_expense_data() 