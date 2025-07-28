#!/usr/bin/env python3
"""
Test script to verify feedback functionality.
"""

import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_USERNAME = "testuser"
TEST_PASSWORD = "testpass123"

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

def test_feedback():
    """Test the feedback endpoint."""
    
    print("Testing Feedback Functionality...")
    print("=" * 50)
    
    # First, login to get token
    token = login_and_get_token()
    if not token:
        print("❌ Cannot proceed without authentication token")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test feedback submission
    print("\n1. Testing Feedback Submission:")
    feedback_message = "This is a test feedback message. The app is working great! 👍"
    
    try:
        response = requests.post(f"{BASE_URL}/feedback", json=feedback_message, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Feedback submitted successfully!")
        else:
            print(f"❌ Error: {response.json()}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    test_feedback() 