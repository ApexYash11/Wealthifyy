#!/usr/bin/env python3
"""
Simple authentication test script
"""
import requests
import json

# Test the login endpoint
def test_login():
    url = "http://localhost:8000/login"
    
    # Test data - replace with actual user credentials from your database
    test_data = {
        "username": "test@example.com",  # Replace with actual email
        "password": "password123"        # Replace with actual password
    }
    
    try:
        response = requests.post(url, data=test_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful!")
            print(f"Token: {data.get('token', 'No token')[:50]}...")
            print(f"User: {data.get('user', {})}")
        else:
            print(f"❌ Login failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

# Test the health endpoint
def test_health():
    url = "http://localhost:8000/health"
    
    try:
        response = requests.get(url)
        print(f"Health Status Code: {response.status_code}")
        print(f"Health Response: {response.text}")
        
    except Exception as e:
        print(f"❌ Health check error: {e}")

if __name__ == "__main__":
    print("🔍 Testing authentication...")
    test_health()
    print("\n" + "="*50 + "\n")
    test_login()
