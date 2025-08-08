#!/usr/bin/env python3
"""
Test Supabase Auth Authentication
This script tests the Supabase Auth fallback when database is not available
"""
import requests
import json

def test_supabase_auth():
    """Test Supabase Auth authentication"""
    base_url = "http://localhost:8000"
    
    print("🔧 Testing Supabase Auth Authentication")
    print("=" * 50)
    
    # Test credentials - these should be valid Supabase Auth credentials
    test_username = "test@example.com"  # Try with a test email
    test_password = "password123"  # Try with a test password
    
    print(f"Testing with username: {test_username}")
    print(f"Testing with password: {test_password}")
    print()
    
    # Test 1: Login (should use Supabase Auth fallback)
    print("1. Testing login with Supabase Auth fallback...")
    try:
        login_data = {
            "username": test_username,
            "password": test_password
        }
        response = requests.post(f"{base_url}/login", data=login_data)
        print(f"Login response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            user_data = data.get('user')
            
            print("✅ Login successful via Supabase Auth!")
            print(f"Token: {token[:50]}..." if token else "No token")
            print(f"User: {user_data}")
            
            # Test 2: Token validation
            print("\n2. Testing token validation...")
            if token:
                validate_data = {"token": token}
                response = requests.post(f"{base_url}/auth/token/validate", json=validate_data)
                print(f"Token validation status: {response.status_code}")
                
                if response.status_code == 200:
                    print("✅ Token validation successful!")
                    print(f"Validation response: {response.json()}")
                    
                    # Test 3: Protected route access
                    print("\n3. Testing protected route access...")
                    headers = {'Authorization': f'Bearer {token}'}
                    user_id = user_data.get('id') if user_data else '1'
                    
                    response = requests.get(f"{base_url}/dashboard/{user_id}", headers=headers)
                    print(f"Protected route status: {response.status_code}")
                    
                    if response.status_code == 200:
                        print("✅ Protected route access successful!")
                        dashboard_data = response.json()
                        print(f"Dashboard data keys: {list(dashboard_data.keys())}")
                    else:
                        print(f"❌ Protected route failed: {response.text}")
                        
                else:
                    print(f"❌ Token validation failed: {response.text}")
            else:
                print("❌ No token received")
                
        elif response.status_code == 401:
            print("❌ Login failed: Invalid credentials")
            print("This is expected if the test credentials don't exist in Supabase Auth")
        elif response.status_code == 503:
            print("❌ Login failed: Authentication service not available")
            print("Supabase Auth service is not working")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

def test_supabase_auth_direct():
    """Test Supabase Auth directly"""
    print("\n" + "=" * 50)
    print("🔧 Testing Supabase Auth Direct Access")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Test the Supabase Auth verification endpoint
    print("Testing Supabase Auth verification endpoint...")
    try:
        # Test with an invalid token
        test_data = {"token": "invalid_token"}
        response = requests.post(f"{base_url}/auth/supabase/verify", json=test_data)
        print(f"Supabase verification status: {response.status_code}")
        
        if response.status_code in [401, 400]:
            print("✅ Supabase Auth verification endpoint working (correctly rejected invalid token)")
        else:
            print(f"⚠️  Unexpected Supabase verification response: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Supabase Auth verification test failed: {e}")

if __name__ == "__main__":
    test_supabase_auth()
    test_supabase_auth_direct()


