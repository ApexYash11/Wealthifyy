#!/usr/bin/env python3
"""
Quick script to test login with specific credentials
"""

import requests

def test_login():
    url = "http://127.0.0.1:8000/login"
    data = {
        "username": "Yash",
        "password": "Yash#8983"
    }
    
    try:
        response = requests.post(url, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            result = response.json()
            print(f"Token: {result.get('token', 'No token')[:50]}...")
            print(f"User: {result.get('user', 'No user data')}")
        else:
            print("❌ Login failed!")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Testing login with Yash / Yash#8983...")
    test_login() 