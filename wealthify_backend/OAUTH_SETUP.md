# OAuth Authentication Setup Guide

## Overview
This guide will help you set up GitHub and Google OAuth authentication for the Wealthify application.

## Backend Setup

### 1. Install Dependencies
The required packages are already installed:
- `authlib` - OAuth client library
- `httpx` - HTTP client for async requests

### 2. Database Changes
The database has been updated with OAuth support:
- Added `oauth_provider` column (github, google, or null)
- Added `oauth_id` column (OAuth provider's user ID)
- Added `avatar_url` column (profile picture URL)
- Made `username` and `password_hash` nullable for OAuth users

### 3. Environment Variables
Add these variables to your `.env` file:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## GitHub OAuth Setup

### 1. Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Wealthify
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:8000/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

### 2. Add to Environment
Add the credentials to your `.env` file:
```env
GITHUB_CLIENT_ID=your-client-id-here
GITHUB_CLIENT_SECRET=your-client-secret-here
```

## Google OAuth Setup

### 1. Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Fill in the details:
   - **Name**: Wealthify
   - **Authorized redirect URIs**: `http://localhost:8000/auth/google/callback`
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

### 2. Add to Environment
Add the credentials to your `.env` file:
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## Frontend Setup

### 1. OAuth Buttons
OAuth buttons have been added to both login and register pages:
- GitHub button with GitHub icon
- Google button with Chrome icon
- Proper loading states and error handling

### 2. Callback Handling
A callback page has been created at `/auth/callback` to handle OAuth redirects.

## API Endpoints

### OAuth Login Flow
1. **Initiate OAuth**: `GET /auth/{provider}/login`
   - Redirects user to OAuth provider
   - Supports: `github`, `google`

2. **OAuth Callback**: `GET /auth/{provider}/callback`
   - Handles OAuth provider callback
   - Creates or logs in user
   - Returns JWT token and user data

### User Data Structure
OAuth users will have additional fields:
```json
{
  "id": "123",
  "email": "user@example.com",
  "name": "username",
  "avatar_url": "https://avatars.githubusercontent.com/u/123",
  "oauth_provider": "github",
  "created_at": "2024-01-01T00:00:00"
}
```

## Testing

### 1. Test Configuration
Run the configuration test:
```bash
python test_oauth_setup.py
```

### 2. Test OAuth Flow
1. Start the backend server: `uvicorn main:app --reload`
2. Start the frontend: `npm run dev`
3. Go to login/register page
4. Click GitHub or Google button
5. Complete OAuth flow
6. Verify user is logged in and redirected to dashboard

## Security Features

### 1. User Association
- OAuth users are uniquely identified by `oauth_provider` + `oauth_id`
- Email addresses are validated to prevent conflicts
- Users cannot register with OAuth if email already exists with different method

### 2. Token Management
- JWT tokens are generated for OAuth users
- Tokens include user ID and expiration
- Proper token validation and refresh handling

### 3. Error Handling
- Comprehensive error handling for OAuth failures
- User-friendly error messages
- Proper logging for debugging

## Troubleshooting

### Common Issues

1. **"Invalid provider" error**
   - Ensure provider is either 'github' or 'google'
   - Check OAuth configuration in main.py

2. **"OAuth authentication failed" error**
   - Verify OAuth credentials in .env file
   - Check callback URLs match exactly
   - Ensure OAuth app is properly configured

3. **"Email already registered" error**
   - User tried to register with OAuth but email exists with password
   - User should login with password instead

4. **CORS errors**
   - Ensure CORS is properly configured in main.py
   - Check frontend URL is in allowed origins

### Debug Steps
1. Check environment variables are set correctly
2. Verify OAuth app configuration matches exactly
3. Check browser console for errors
4. Check backend logs for detailed error messages
5. Test OAuth flow step by step

## Production Deployment

### 1. Update Callback URLs
For production, update callback URLs to your domain:
- GitHub: `https://yourdomain.com/auth/github/callback`
- Google: `https://yourdomain.com/auth/google/callback`

### 2. Environment Variables
Update environment variables for production:
```env
GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-production-github-client-secret
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
```

### 3. Security Considerations
- Use HTTPS in production
- Store secrets securely
- Implement rate limiting
- Add proper logging and monitoring
- Consider implementing refresh tokens

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all configuration steps
3. Test with a simple OAuth flow
4. Check backend and frontend logs
5. Ensure all dependencies are installed correctly 