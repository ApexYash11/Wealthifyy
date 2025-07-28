#!/usr/bin/env python3
"""
Test script to verify prediction endpoints with authentication.
"""

import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_USERNAME = "testuser"
TEST_PASSWORD = "testpass123"
TEST_USER_ID = 2
TEST_MONTH = "Jul-2025"
TEST_INCOME = 65000.0

def login_and_get_token():
    """Login and get JWT token."""
    login_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", data=login_data)
        print(f"Login Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user")
            print(f"✅ Login successful for user: {user.get('name')} (ID: {user.get('id')})")
            return token
        else:
            print(f"❌ Login failed: {response.json()}")
            return None
            
    except Exception as e:
        print(f"❌ Login request failed: {e}")
        return None

def test_predictions_with_auth():
    """Test the prediction endpoints with authentication."""
    
    print("Testing AI Financial Predictions with Authentication...")
    print("=" * 60)
    
    # First, login to get token
    token = login_and_get_token()
    if not token:
        print("❌ Cannot proceed without authentication token")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test expense prediction
    print("\n1. Testing Expense Prediction:")
    expense_data = {
        "user_id": TEST_USER_ID,
        "month": TEST_MONTH
    }
    
    try:
        response = requests.post(f"{BASE_URL}/predict-expense", json=expense_data, headers=headers)
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
        response = requests.post(f"{BASE_URL}/predict/savings", json=savings_data, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            prediction = response.json()["prediction"]
            print(f"✅ Savings Prediction: ₹{prediction:,.2f}")
        else:
            print(f"❌ Error: {response.json()}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print("\n" + "=" * 60)
    print("Test completed!")

if __name__ == "__main__":
    test_predictions_with_auth() 