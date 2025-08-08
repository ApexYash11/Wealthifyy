# Wealthify Setup Guide

This guide will help you set up the Wealthify application with a fully functional backend and frontend, including authentication.

## 🏗️ Architecture Overview

- **Backend**: FastAPI with JWT authentication, Supabase OAuth, and PostgreSQL database
- **Frontend**: Next.js with NextAuth.js, TypeScript, and Tailwind CSS
- **Authentication**: Multiple auth methods (JWT, OAuth with Google/GitHub, Supabase)

## 📋 Prerequisites

- Python 3.8+ installed
- Node.js 18+ installed
- PostgreSQL database (or use SQLite for development)
- Git

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd Wealthify

# Setup backend
cd wealthify_backend
python -m venv env
# On Windows:
env\Scripts\activate
# On macOS/Linux:
source env/bin/activate

# Setup frontend
cd ../wealthify_frontend
npm install
```

### 2. Backend Configuration

```bash
cd wealthify_backend

# Copy environment template
cp env-template.txt .env

# Edit .env file with your configuration
# See Backend Environment Variables section below
```

### 3. Frontend Configuration

```bash
cd wealthify_frontend

# Copy environment template
cp env-template.txt .env.local

# Edit .env.local file with your configuration
# See Frontend Environment Variables section below
```

### 4. Start the Application

```bash
# Terminal 1: Start Backend
cd wealthify_backend
python start.py

# Terminal 2: Start Frontend
cd wealthify_frontend
npm run dev
```

## 🔧 Backend Environment Variables

Create a `.env` file in `wealthify_backend/` with the following variables:

```env
# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/wealthify_db
# OR for SQLite (development):
# DATABASE_URL=sqlite:///./wealthify.db

# Supabase Configuration (for OAuth)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Email Configuration (for password reset)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@wealthify.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=Wealthify

# Frontend URL (for CORS and OAuth redirects)
FRONTEND_URL=http://localhost:3000

# Default Financial Settings
DEFAULT_SAVINGS_GOAL=10000.0
DEFAULT_SAVINGS_RATE=0.2
EMERGENCY_FUND_MONTHS=3
```

## 🔧 Frontend Environment Variables

Create a `.env.local` file in `wealthify_frontend/` with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# OAuth Provider Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Supabase Configuration (if using Supabase directly)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🔐 Authentication Setup

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:8000/auth/oauth/callback`
6. Copy Client ID and Client Secret to your environment variables

### 2. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL: `http://localhost:3000`
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Client Secret to your environment variables

### 3. Supabase Setup (Optional)

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Go to Settings → API
3. Copy Project URL and anon key
4. Enable Google OAuth in Authentication → Providers
5. Add your environment variables

## 🗄️ Database Setup

### Option 1: PostgreSQL (Recommended for Production)

```bash
# Install PostgreSQL
# On Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# On macOS with Homebrew:
brew install postgresql

# Create database
createdb wealthify_db

# Update DATABASE_URL in .env file
```

### Option 2: SQLite (Development)

```env
DATABASE_URL=sqlite:///./wealthify.db
```

## 🚀 Running the Application

### Development Mode

```bash
# Backend (Terminal 1)
cd wealthify_backend
python start.py

# Frontend (Terminal 2)
cd wealthify_frontend
npm run dev
```

### Production Mode

```bash
# Backend
cd wealthify_backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend
cd wealthify_frontend
npm run build
npm start
```

## 📱 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔍 Testing the Setup

### 1. Test Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "available",
  "timestamp": "2024-01-01T00:00:00"
}
```

### 2. Test Authentication

1. Go to http://localhost:3000/register
2. Create a new account
3. Try logging in at http://localhost:3000/login
4. Test OAuth providers (Google/GitHub)

### 3. Test API Endpoints

```bash
# Get API documentation
curl http://localhost:8000/docs

# Test protected endpoint (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/auth/me
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 8000
   lsof -ti:8000 | xargs kill -9
   
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database connection issues**
   - Check DATABASE_URL format
   - Ensure database server is running
   - Verify credentials

3. **OAuth not working**
   - Check redirect URIs in OAuth provider settings
   - Verify environment variables
   - Check browser console for errors

4. **CORS issues**
   - Ensure FRONTEND_URL is set correctly
   - Check CORS configuration in main.py

### Debug Mode

```bash
# Backend with debug logging
cd wealthify_backend
uvicorn main:app --reload --log-level debug

# Frontend with debug logging
cd wealthify_frontend
DEBUG=* npm run dev
```

## 📚 API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - User logout
- `GET /dashboard/{user_id}` - Get dashboard data
- `POST /expenses` - Create expenses
- `GET /transactions/{user_id}` - Get transactions
- `POST /assets` - Add assets
- `GET /portfolio/overview` - Get portfolio overview

## 🔒 Security Notes

1. **Never commit .env files** - They contain sensitive information
2. **Use strong SECRET_KEY** - Generate a secure random key
3. **Enable HTTPS in production** - Update CORS and cookie settings
4. **Regular security updates** - Keep dependencies updated
5. **Database security** - Use strong passwords and proper access controls

## 📈 Next Steps

1. **Customize the UI** - Modify components in `wealthify_frontend/components/`
2. **Add new features** - Extend the API in `wealthify_backend/main.py`
3. **Deploy to production** - Set up proper hosting and database
4. **Add monitoring** - Implement logging and error tracking
5. **Performance optimization** - Add caching and database indexing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
