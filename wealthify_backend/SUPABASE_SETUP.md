# Supabase Integration Setup Guide

## Overview
This guide explains how to set up Supabase Auth and database integration for the Wealthify backend.

## Prerequisites
1. A Supabase project with the following tables already created:
   - `users`
   - `expenses`
   - `transactions`
   - `assets`
   - `portfolio_snapshots`
   - `feedback`

## Environment Variables Setup

Create a `.env` file in the `wealthify_backend` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT Configuration (Legacy - kept for backward compatibility)
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Default Values
DEFAULT_SAVINGS_GOAL=10000.0
DEFAULT_SAVINGS_RATE=0.2
EMERGENCY_FUND_MONTHS=3

# Email Configuration (for legacy password reset)
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password
MAIL_FROM=noreply@wealthify.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=Wealthify

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL**: `SUPABASE_URL`
   - **anon public key**: `SUPABASE_ANON_KEY`
   - **service_role secret key**: `SUPABASE_SERVICE_ROLE_KEY`

## Database Connection String

The `DATABASE_URL` should follow this format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

You can find this in your Supabase dashboard under Settings > Database.

## Installation

1. Install the new dependencies:
```bash
pip install -r requirements.txt
```

2. The new dependencies added are:
   - `supabase==2.3.4`
   - `python-jose[cryptography]==3.3.0`

## Database Schema Updates

The User model has been updated to include Supabase Auth fields:
- `supabase_id`: Stores the Supabase Auth UUID
- `oauth_provider`: OAuth provider (google, github, etc.)
- `oauth_id`: OAuth provider user ID
- `avatar_url`: User avatar URL

The following fields are now nullable for Supabase Auth users:
- `username`: Can be null for OAuth users
- `password_hash`: Set to "supabase_auth" for Supabase Auth users

## Authentication Flow

### New Users (Supabase Auth)
1. User registers via `/register` endpoint
2. User is created in both Supabase Auth and your database
3. Supabase JWT token is returned for authentication

### Existing Users (Legacy)
1. Users can still login with username/password
2. Legacy JWT tokens are still supported
3. Password reset works via email

### Mixed Authentication
- The system supports both Supabase Auth and legacy authentication
- Users are identified by `password_hash` field:
  - `"supabase_auth"` = Supabase Auth user
  - `hashed_password` = Legacy user

## New Endpoints

### Supabase Auth Endpoints
- `POST /auth/supabase/verify` - Verify Supabase JWT token
- `POST /auth/supabase/signout` - Sign out from Supabase
- `POST /auth/supabase/refresh` - Refresh access token

### Health Check
- `GET /health` - Check system health and Supabase connection

## Testing the Integration

1. Start the backend server:
```bash
python main.py
```

2. Test the health endpoint:
```bash
curl http://localhost:8000/health
```

3. Test Supabase registration:
```bash
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "username": "testuser"}'
```

## Migration Notes

### For Existing Users
- Existing users can continue using their current authentication
- No migration is required for existing data
- New users will use Supabase Auth by default

### Database Changes
- The `users` table now includes Supabase Auth fields
- Existing data remains compatible
- New fields are nullable to maintain backward compatibility

## Security Considerations

1. **Environment Variables**: Never commit your `.env` file to version control
2. **Service Role Key**: Keep the service role key secure and only use it server-side
3. **JWT Tokens**: Supabase handles JWT token validation and expiration
4. **Password Hashing**: Supabase handles password hashing for new users

## Troubleshooting

### Common Issues

1. **Connection Error**: Check your `DATABASE_URL` and ensure it's correct
2. **Authentication Error**: Verify your Supabase credentials
3. **Import Error**: Make sure all dependencies are installed

### Debug Mode
Enable debug logging by setting:
```python
# In main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Next Steps

1. Update your frontend to use Supabase Auth tokens
2. Configure Supabase Auth settings in your dashboard
3. Set up OAuth providers if needed
4. Test the complete authentication flow 