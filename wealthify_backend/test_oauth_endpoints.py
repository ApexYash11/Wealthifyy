import requests
import json

def test_oauth_endpoints():
    """Test OAuth endpoints"""
    base_url = "http://localhost:8000"
    
    print("🔍 Testing OAuth Endpoints...")
    print("=" * 50)
    
    # Test GitHub OAuth login endpoint
    try:
        github_response = requests.get(f"{base_url}/auth/github/login", allow_redirects=False)
        print(f"GitHub OAuth Login:")
        print(f"  Status Code: {github_response.status_code}")
        if github_response.status_code in [302, 307]:  # Redirect
            print(f"  Redirect URL: {github_response.headers.get('Location', 'No redirect URL')}")
            print("  ✅ GitHub OAuth endpoint is working!")
        else:
            print(f"  ❌ Unexpected status code: {github_response.status_code}")
    except Exception as e:
        print(f"  ❌ Error testing GitHub OAuth: {e}")
    
    print()
    
    # Test Google OAuth login endpoint
    try:
        google_response = requests.get(f"{base_url}/auth/google/login", allow_redirects=False)
        print(f"Google OAuth Login:")
        print(f"  Status Code: {google_response.status_code}")
        if google_response.status_code in [302, 307]:  # Redirect
            print(f"  Redirect URL: {google_response.headers.get('Location', 'No redirect URL')}")
            print("  ✅ Google OAuth endpoint is working!")
        else:
            print(f"  ❌ Unexpected status code: {google_response.status_code}")
    except Exception as e:
        print(f"  ❌ Error testing Google OAuth: {e}")
    
    print()
    
    # Test invalid provider
    try:
        invalid_response = requests.get(f"{base_url}/auth/invalid/login")
        print(f"Invalid Provider Test:")
        print(f"  Status Code: {invalid_response.status_code}")
        if invalid_response.status_code == 400:
            print("  ✅ Invalid provider correctly rejected!")
        else:
            print(f"  ❌ Unexpected status code: {invalid_response.status_code}")
    except Exception as e:
        print(f"  ❌ Error testing invalid provider: {e}")
    
    print("\n" + "=" * 50)
    print("OAuth endpoint testing completed!")

if __name__ == "__main__":
    test_oauth_endpoints() 