#!/usr/bin/env python3
"""
Test script to verify prediction endpoints are working correctly.
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Test configuration from environment variables
BASE_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
TEST_USER_ID = int(os.getenv("TEST_USER_ID", "1"))  # Default to user ID 1
TEST_MONTH = os.getenv("TEST_MONTH", "Jul-2025")
TEST_INCOME = float(os.getenv("TEST_INCOME", "65000.0"))

def test_predictions():
    """Test the prediction endpoints."""
    
    print("Testing AI Financial Predictions...")
    print("=" * 50)
    print(f"Base URL: {BASE_URL}")
    print(f"Test User ID: {TEST_USER_ID}")
    print(f"Test Month: {TEST_MONTH}")
    print(f"Test Income: ₹{TEST_INCOME:,.2f}")
    print()
    
    # Test expense prediction
    print("1. Testing Expense Prediction:")
    expense_data = {
        "user_id": TEST_USER_ID,
        "month": TEST_MONTH
    }
    
    try:
        response = requests.post(f"{BASE_URL}/predict-expense", json=expense_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            prediction = response.json()["prediction"]
            print(f"✅ Expense Prediction: ₹{prediction:,.2f}")
        else:
            print(f"❌ Error: {response.json()}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test savings prediction
    print("\n2. Testing Savings Prediction:")
    savings_data = {
        "user_id": TEST_USER_ID,
        "month": TEST_MONTH,
        "income": TEST_INCOME
    }
    
    try:
        response = requests.post(f"{BASE_URL}/predict/savings", json=savings_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            prediction = response.json()["prediction"]
            print(f"✅ Savings Prediction: ₹{prediction:,.2f}")
        else:
            print(f"❌ Error: {response.json()}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    test_predictions() 