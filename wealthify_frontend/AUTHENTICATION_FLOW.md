# Simplified Authentication Flow

## Overview
Wealthify now uses a simplified authentication system with only two components:
1. **JWT Authentication** (FastAPI backend) - for traditional email/password login
2. **Supabase OAuth** - for Google and GitHub authentication

## Authentication Methods

### 1. Traditional JWT Authentication
- **Registration**: `/register` endpoint creates user with bcrypt-hashed password
- **Login**: `/login` endpoint validates credentials and returns JWT token
- **Token Management**: Backend TokenManager handles token storage and validation

### 2. Supabase OAuth Authentication
- **Providers**: Google and GitHub
- **Flow**: 
  1. User clicks OAuth button
  2. Redirected to provider (Google/GitHub)
  3. After consent, redirected to `/auth/callback`
  4. Callback page processes session and stores in localStorage
  5. User redirected to dashboard

## Frontend Components

### Login Page (`/app/login/page.tsx`)
- Traditional username/password form
- Google OAuth button
- GitHub OAuth button
- Unified OAuth handler function

### Register Page (`/app/register/page.tsx`)
- Traditional registration form
- Google OAuth button
- GitHub OAuth button
- Same OAuth handler as login

### Auth Callback (`/app/auth/callback/page.tsx`)
- Processes OAuth redirect
- Validates session with Supabase
- Stores session in localStorage
- Redirects to dashboard

### AuthContext (`/context/AuthContext.tsx`)
- Manages authentication state
- Handles both JWT and Supabase sessions
- Provides user data to components

## Backend Integration

### Token Management
- `TokenManager` class handles both JWT and Supabase tokens
- Automatic token validation and refresh
- Session persistence across page reloads

### API Protection
- All protected endpoints use `get_current_user_supabase` dependency
- Supports both legacy JWT and Supabase tokens
- Automatic user lookup from database

## Environment Variables Required

### Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend Configuration
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Supabase OAuth Setup

### Google OAuth
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add Google OAuth credentials (Client ID and Secret)
4. Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### GitHub OAuth
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable GitHub provider
3. Add GitHub OAuth credentials (Client ID and Secret)
4. Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

## Benefits of This Approach

1. **Simplified Architecture**: No need for NextAuth.js
2. **Unified Token Management**: Single system for all auth types
3. **Better Performance**: Fewer dependencies and API calls
4. **Easier Maintenance**: Single authentication provider (Supabase)
5. **Scalable**: Easy to add more OAuth providers through Supabase

## Migration Notes

- Removed NextAuth.js dependency
- Updated all OAuth buttons to use Supabase directly
- Maintained backward compatibility with existing JWT tokens
- Unified error handling across all authentication methods
