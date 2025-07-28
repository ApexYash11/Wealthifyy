import requests
import json

def test_predictions():
    """Quick test of prediction endpoints"""
    
    # Test data
    test_data = {
        "user_id": 20339,
        "month": "Mar-2025",
        "income": 40000
    }
    
    print("Testing predictions for ₹40,000 income...")
    
    # Test expense prediction
    try:
        response = requests.post("http://127.0.0.1:8000/predict-expense", json=test_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Expense Prediction: ₹{result['prediction']:,.2f}")
        else:
            print(f"❌ Expense Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Expense Request failed: {e}")
    
    # Test savings prediction
    try:
        response = requests.post("http://127.0.0.1:8000/predict/savings", json=test_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Savings Prediction: ₹{result['prediction']:,.2f}")
        else:
            print(f"❌ Savings Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Savings Request failed: {e}")

if __name__ == "__main__":
    test_predictions() 