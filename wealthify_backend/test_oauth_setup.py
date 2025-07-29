import os
from dotenv import load_dotenv

def test_oauth_configuration():
    """Test OAuth configuration"""
    load_dotenv()
    
    print("🔍 Testing OAuth Configuration...")
    print("=" * 50)
    
    # Check GitHub OAuth
    github_client_id = os.getenv('GITHUB_CLIENT_ID')
    github_client_secret = os.getenv('GITHUB_CLIENT_SECRET')
    
    print("GitHub OAuth:")
    print(f"  Client ID: {'✅ Set' if github_client_id else '❌ Not set'}")
    print(f"  Client Secret: {'✅ Set' if github_client_secret else '❌ Not set'}")
    
    # Check Google OAuth
    google_client_id = os.getenv('GOOGLE_CLIENT_ID')
    google_client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
    
    print("\nGoogle OAuth:")
    print(f"  Client ID: {'✅ Set' if google_client_id else '❌ Not set'}")
    print(f"  Client Secret: {'✅ Set' if google_client_secret else '❌ Not set'}")
    
    # Check other required environment variables
    secret_key = os.getenv('SECRET_KEY')
    database_url = os.getenv('DATABASE_URL')
    
    print("\nOther Configuration:")
    print(f"  SECRET_KEY: {'✅ Set' if secret_key else '❌ Not set'}")
    print(f"  DATABASE_URL: {'✅ Set' if database_url else '❌ Not set'}")
    
    print("\n" + "=" * 50)
    
    if not github_client_id or not github_client_secret:
        print("⚠️  GitHub OAuth not configured. To set up:")
        print("   1. Go to https://github.com/settings/developers")
        print("   2. Create a new OAuth App")
        print("   3. Set Authorization callback URL to: http://localhost:8000/auth/github/callback")
        print("   4. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to your .env file")
    
    if not google_client_id or not google_client_secret:
        print("⚠️  Google OAuth not configured. To set up:")
        print("   1. Go to https://console.cloud.google.com/apis/credentials")
        print("   2. Create a new OAuth 2.0 Client ID")
        print("   3. Set Authorized redirect URIs to: http://localhost:8000/auth/google/callback")
        print("   4. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file")
    
    if github_client_id and github_client_secret and google_client_id and google_client_secret:
        print("✅ OAuth configuration is complete!")
        print("   You can now test OAuth login/registration.")
    else:
        print("❌ OAuth configuration is incomplete.")
        print("   Please configure the missing OAuth providers.")

if __name__ == "__main__":
    test_oauth_configuration() 