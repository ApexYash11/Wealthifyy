import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def login_and_get_token():
    """Login and get JWT token"""
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", data=login_data)
        if response.status_code == 200:
            result = response.json()
            return result.get("access_token")
        else:
            print(f"❌ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login request failed: {e}")
        return None

def test_predictions():
    """Test the improved prediction endpoints"""
    
    # Get authentication token
    token = login_and_get_token()
    if not token:
        print("❌ Cannot proceed without authentication")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test data
    test_income = 40000
    test_month = "Mar-2025"
    test_user_id = 20339  # Use the user ID from your database
    
    print(f"Testing predictions for ₹{test_income} income...")
    
    # Test expense prediction
    print("\n=== Testing Expense Prediction ===")
    expense_data = {
        "user_id": test_user_id,
        "month": test_month,
        "income": test_income
    }
    
    try:
        response = requests.post(f"{BASE_URL}/predict-expense", json=expense_data, headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Expense Prediction: ₹{result['prediction']:,.2f}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test savings prediction
    print("\n=== Testing Savings Prediction ===")
    savings_data = {
        "user_id": test_user_id,
        "month": test_month,
        "income": test_income
    }
    
    try:
        response = requests.post(f"{BASE_URL}/predict/savings", json=savings_data, headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Savings Prediction: ₹{result['prediction']:,.2f}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test realistic predictions function directly
    print("\n=== Testing Realistic Predictions Function ===")
    try:
        from ml_model import get_realistic_predictions
        expenses, savings = get_realistic_predictions(test_income)
        print(f"✅ Realistic Expenses: ₹{expenses:,.2f}")
        print(f"✅ Realistic Savings: ₹{savings:,.2f}")
    except Exception as e:
        print(f"❌ Error testing realistic predictions: {e}")

if __name__ == "__main__":
    test_predictions() 