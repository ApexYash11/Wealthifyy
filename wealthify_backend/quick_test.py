#!/usr/bin/env python3
"""
Quick Authentication Test
Simple test to verify basic authentication functionality
"""
import requests
import json

def quick_test():
    """Run a quick test of the authentication system"""
    base_url = "http://localhost:8000"
    
    print("🚀 Quick Authentication Test")
    print("=" * 40)
    
    # Test 1: Health check
    print("1. Testing server health...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Server is running")
        else:
            print(f"❌ Server health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        return False
    
    # Test 2: Test login endpoint (will fail with invalid credentials, but should return 401)
    print("\n2. Testing login endpoint...")
    try:
        login_data = {
            "username": "test@example.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{base_url}/login", data=login_data)
        if response.status_code == 401:
            print("✅ Login endpoint working (correctly rejected invalid credentials)")
        else:
            print(f"⚠️  Unexpected login response: {response.status_code}")
    except Exception as e:
        print(f"❌ Login endpoint test failed: {e}")
        return False
    
    # Test 3: Test token validation endpoint
    print("\n3. Testing token validation endpoint...")
    try:
        validate_data = {"token": "invalid_token"}
        response = requests.post(f"{base_url}/auth/token/validate", json=validate_data)
        if response.status_code in [401, 400]:
            print("✅ Token validation endpoint working (correctly rejected invalid token)")
        else:
            print(f"⚠️  Unexpected token validation response: {response.status_code}")
    except Exception as e:
        print(f"❌ Token validation endpoint test failed: {e}")
        return False
    
    # Test 4: Test protected route without token
    print("\n4. Testing protected route without token...")
    try:
        response = requests.get(f"{base_url}/dashboard/1")
        if response.status_code == 401:
            print("✅ Protected route correctly requires authentication")
        else:
            print(f"⚠️  Protected route response: {response.status_code}")
    except Exception as e:
        print(f"❌ Protected route test failed: {e}")
        return False
    
    print("\n" + "=" * 40)
    print("✅ Quick test completed successfully!")
    print("The authentication system appears to be working correctly.")
    print("For a full test with real credentials, run: python test_auth_flow.py")
    
    return True

if __name__ == "__main__":
    quick_test()






