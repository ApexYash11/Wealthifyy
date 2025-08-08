#!/usr/bin/env python3
"""
Comprehensive Authentication Flow Test
Tests the complete authentication system including login, token validation, and protected routes
"""
import requests
import json
import time
from typing import Optional

class AuthFlowTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.user_data = None
        
    def test_health_check(self) -> bool:
        """Test if the server is running"""
        print("🔍 Testing server health...")
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                print(f"✅ Server is healthy: {response.json()}")
                return True
            else:
                print(f"❌ Server health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Server health check failed: {e}")
            return False
    
    def test_login_with_invalid_credentials(self) -> bool:
        """Test login with invalid credentials (should fail)"""
        print("\n🔍 Testing login with invalid credentials...")
        try:
            login_data = {
                "username": "invalid@example.com",
                "password": "wrongpassword"
            }
            response = self.session.post(f"{self.base_url}/login", data=login_data)
            if response.status_code == 401:
                print("✅ Invalid credentials correctly rejected")
                return True
            else:
                print(f"❌ Unexpected response for invalid credentials: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Login test failed: {e}")
            return False
    
    def test_login_with_valid_credentials(self, username: str, password: str) -> bool:
        """Test login with valid credentials"""
        print(f"\n🔍 Testing login with valid credentials: {username}")
        try:
            login_data = {
                "username": username,
                "password": password
            }
            response = self.session.post(f"{self.base_url}/login", data=login_data)
            print(f"Login response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get('token')
                self.user_data = data.get('user')
                
                if self.auth_token:
                    print("✅ Login successful!")
                    print(f"Token received: {self.auth_token[:50]}...")
                    print(f"User data: {self.user_data}")
                    
                    # Set the token in session headers
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.auth_token}'
                    })
                    return True
                else:
                    print("❌ No token received in response")
                    return False
            else:
                print(f"❌ Login failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login test failed: {e}")
            return False
    
    def test_token_validation(self) -> bool:
        """Test token validation endpoint"""
        if not self.auth_token:
            print("❌ No token available for validation test")
            return False
            
        print("\n🔍 Testing token validation...")
        try:
            validate_data = {"token": self.auth_token}
            response = self.session.post(f"{self.base_url}/auth/token/validate", json=validate_data)
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Token validation successful!")
                print(f"Validation response: {data}")
                return True
            else:
                print(f"❌ Token validation failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Token validation test failed: {e}")
            return False
    
    def test_protected_route(self) -> bool:
        """Test accessing a protected route with the token"""
        if not self.auth_token:
            print("❌ No token available for protected route test")
            return False
            
        print("\n🔍 Testing protected route access...")
        try:
            # Test dashboard endpoint (requires authentication)
            user_id = self.user_data.get('id') if self.user_data else '1'
            response = self.session.get(f"{self.base_url}/dashboard/{user_id}")
            
            if response.status_code == 200:
                print("✅ Protected route access successful!")
                data = response.json()
                print(f"Dashboard data: {json.dumps(data, indent=2)[:200]}...")
                return True
            else:
                print(f"❌ Protected route access failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Protected route test failed: {e}")
            return False
    
    def test_protected_route_without_token(self) -> bool:
        """Test accessing a protected route without token (should fail)"""
        print("\n🔍 Testing protected route without token...")
        try:
            # Remove authorization header
            self.session.headers.pop('Authorization', None)
            
            response = self.session.get(f"{self.base_url}/dashboard/1")
            
            if response.status_code == 401:
                print("✅ Protected route correctly rejected without token")
                return True
            else:
                print(f"❌ Unexpected response without token: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Protected route test failed: {e}")
            return False
    
    def test_logout(self) -> bool:
        """Test logout functionality"""
        if not self.auth_token:
            print("❌ No token available for logout test")
            return False
            
        print("\n🔍 Testing logout...")
        try:
            # Restore authorization header
            self.session.headers.update({
                'Authorization': f'Bearer {self.auth_token}'
            })
            
            response = self.session.post(f"{self.base_url}/auth/logout")
            
            if response.status_code == 200:
                print("✅ Logout successful!")
                # Clear the token
                self.auth_token = None
                self.user_data = None
                self.session.headers.pop('Authorization', None)
                return True
            else:
                print(f"❌ Logout failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Logout test failed: {e}")
            return False
    
    def run_comprehensive_test(self, test_username: str, test_password: str):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive Authentication Flow Test")
        print("=" * 60)
        
        tests = [
            ("Health Check", self.test_health_check),
            ("Invalid Login", self.test_login_with_invalid_credentials),
            ("Valid Login", lambda: self.test_login_with_valid_credentials(test_username, test_password)),
            ("Token Validation", self.test_token_validation),
            ("Protected Route Access", self.test_protected_route),
            ("Protected Route Without Token", self.test_protected_route_without_token),
            ("Logout", self.test_logout),
        ]
        
        results = []
        for test_name, test_func in tests:
            print(f"\n{'='*20} {test_name} {'='*20}")
            try:
                result = test_func()
                results.append((test_name, result))
                if not result:
                    print(f"⚠️  {test_name} failed - continuing with other tests...")
            except Exception as e:
                print(f"❌ {test_name} crashed: {e}")
                results.append((test_name, False))
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = 0
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name}: {status}")
            if result:
                passed += 1
        
        print(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Authentication flow is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the output above for details.")
        
        return passed == total

def main():
    """Main test function"""
    print("🔧 Authentication Flow Test")
    print("This test will verify the complete authentication system.")
    print("Make sure the server is running on http://localhost:8000")
    print()
    
    # Test credentials (you can modify these)
    test_username = input("Enter test username/email: ").strip()
    test_password = input("Enter test password: ").strip()
    
    if not test_username or not test_password:
        print("❌ Please provide both username and password")
        return
    
    # Create tester and run tests
    tester = AuthFlowTester()
    success = tester.run_comprehensive_test(test_username, test_password)
    
    if success:
        print("\n🎉 Authentication system is working correctly!")
    else:
        print("\n⚠️  Authentication system has issues. Check the test output above.")

if __name__ == "__main__":
    main()


