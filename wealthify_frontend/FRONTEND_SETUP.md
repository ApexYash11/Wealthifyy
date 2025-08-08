# Frontend Setup Guide

## Environment Variables

Create a `.env.local` file in the `wealthify_frontend` directory with the following variables:

```env
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase Configuration (required for Google OAuth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NextAuth Configuration (optional - if using NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Important Notes

- **Google OAuth**: Requires Supabase credentials in frontend for OAuth flow
- **Backend Integration**: Backend handles user verification and session management
- **JWT tokens**: Authentication tokens are managed by Supabase and synced with backend

## Running the Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- ✅ Supabase Authentication integration
- ✅ Real-time auth state management
- ✅ Automatic token refresh
- ✅ Session persistence
- ✅ Backend API integration

## Authentication Flow

1. **Registration**: Uses Supabase Auth with backend sync
2. **Login**: Uses Supabase Auth with backend sync
3. **Logout**: Signs out from Supabase and clears local state
4. **Session Management**: Automatic token refresh and persistence

## API Integration

The frontend now uses Supabase for authentication but still integrates with your FastAPI backend for:
- User data synchronization
- Financial data operations
- ML predictions
- Dashboard data 