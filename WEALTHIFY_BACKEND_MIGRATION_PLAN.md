# Wealthify Backend Migration Plan
## Complete FastAPI Backend Rebuild Strategy

---

## 📋 Table of Contents
1. [API Discovery](#step-1--api-discovery)
2. [Backend Structure Plan](#step-2--backend-structure-plan)
3. [Dependencies & Setup](#step-3--dependencies--setup)
4. [Auth & Security Plan](#step-4--auth--security-plan)
5. [Migration Guide](#step-5--migration-guide)

---

## Step 1 – API Discovery

### Frontend API Calls Analysis

Based on the frontend code analysis, here are all the API endpoints currently being used:

| Endpoint | Method | Request Payload | Expected Response | Purpose |
|----------|--------|-----------------|-------------------|---------|
| `/auth/login` | POST | `{username, password}` (FormData) | `{access_token, token_type, user}` | Traditional login |
| `/auth/register` | POST | `{username, email, password, name?}` | `{access_token, token_type, user}` | User registration |
| `/auth/validate` | POST | `{token}` | `{valid, user_id?, email?, token_type?, error?}` | Token validation |
| `/auth/me` | GET | None (Bearer token) | `{id, username, email, name?}` | Get current user |
| `/auth/logout` | POST | None (Bearer token) | `{message}` | Logout user |
| `/auth/refresh` | POST | `X-Refresh-Token` header | `{access_token, token_type}` | Refresh token |
| `/auth/oauth/google` | GET | None | Redirect to Google OAuth | Initiate Google OAuth |
| `/auth/oauth/github` | GET | None | Redirect to GitHub OAuth | Initiate GitHub OAuth |
| `/auth/oauth/callback` | POST | `{code, state?}` | `{access_token, token_type, user}` | OAuth callback |
| `/forgot-password` | POST | `{email}` (FormData) | `{message}` | Password reset request |
| `/reset-password` | POST | `{token, new_password}` (FormData) | `{message}` | Reset password |
| `/expenses/{user_id}` | GET | Query: `month?` | `[{id, user_id, month, categories, total_amount}]` | Get user expenses |
| `/expenses` | POST | `{user_id, month, categories}` | `{id, user_id, month, categories, total_amount}` | Add expenses |
| `/predict-expense` | POST | `{income, user_id, month}` | `{predicted_amount, confidence}` | Predict expenses |
| `/predict/savings` | POST | `{income, user_id, month}` | `{predicted_amount, confidence}` | Predict savings |
| `/predict/6-month-forecast` | POST | `{user_id, income}` | `{forecast_data}` | 6-month forecast |
| `/transactions/{user_id}` | GET | Query: `limit?` | `[{id, user_id, type, description, amount, category, date}]` | Get transactions |
| `/transactions` | POST | `{user_id, type, description, amount, category, date}` | `{id, user_id, type, description, amount, category, date}` | Add transaction |
| `/users/{user_id}/savings-goal` | GET | None | `{savings_goal}` | Get savings goal |
| `/users/{user_id}/savings-goal` | PUT | `{savings_goal}` | `{message}` | Update savings goal |
| `/users/{user_id}/calculate-savings-goal` | POST | None | `{savings_goal}` | Calculate smart savings goal |
| `/users/{user_id}/current-savings` | PUT | `{current_savings}` | `{message}` | Update current savings |
| `/dashboard/{user_id}` | GET | None | `{financial_summary, spending_breakdown, recent_transactions}` | Dashboard data |
| `/feedback` | POST | `{message}` | `{message}` | Submit feedback |
| `/feedback` | GET | None | `[{id, user_id, message, created_at}]` | Get feedback |
| `/assets` | GET | None | `[{id, user_id, name, symbol, type, quantity, buy_price, buy_date}]` | Get assets |
| `/assets` | POST | `{name, symbol, type, quantity, buy_price, buy_date}` | `{id, user_id, name, symbol, type, quantity, buy_price, buy_date}` | Add asset |
| `/assets/{asset_id}` | PUT | `{name, symbol, type, quantity, buy_price, buy_date}` | `{id, user_id, name, symbol, type, quantity, buy_price, buy_date}` | Update asset |
| `/assets/{asset_id}` | DELETE | None | `{message}` | Delete asset |
| `/portfolio/overview` | GET | None | `{total_value, total_invested, total_gain_loss, assets}` | Portfolio overview |
| `/portfolio/history` | GET | None | `[{id, user_id, total_value, timestamp}]` | Portfolio history |
| `/portfolio/snapshot` | POST | None | `{message}` | Take portfolio snapshot |

### Authentication Flow
- **JWT Tokens**: Bearer token in Authorization header
- **Cookie Support**: `auth_token` cookie for session management
- **OAuth Integration**: Google and GitHub via Supabase
- **Token Refresh**: Automatic refresh mechanism
- **CORS**: Configured for localhost:3000, 3001

---

## Step 2 – Backend Structure Plan

### Proposed FastAPI Backend Structure

```
wealthify_backend_new/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py         # Environment variables & config
│   │   └── database.py         # Database connection setup
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py            # User model
│   │   ├── expense.py         # Expense model
│   │   ├── transaction.py     # Transaction model
│   │   ├── asset.py           # Asset model
│   │   ├── portfolio.py       # Portfolio models
│   │   └── feedback.py        # Feedback model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py            # User Pydantic schemas
│   │   ├── expense.py         # Expense schemas
│   │   ├── transaction.py     # Transaction schemas
│   │   ├── asset.py           # Asset schemas
│   │   ├── portfolio.py       # Portfolio schemas
│   │   ├── auth.py            # Authentication schemas
│   │   └── common.py          # Common response schemas
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py        # Authentication routes
│   │   │   ├── users.py       # User management routes
│   │   │   ├── expenses.py    # Expense routes
│   │   │   ├── transactions.py # Transaction routes
│   │   │   ├── assets.py      # Asset routes
│   │   │   ├── portfolio.py   # Portfolio routes
│   │   │   ├── dashboard.py   # Dashboard routes
│   │   │   ├── predictions.py # ML prediction routes
│   │   │   └── feedback.py    # Feedback routes
│   │   └── deps.py            # Dependencies (auth, database)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py        # JWT, password hashing
│   │   ├── auth.py            # Authentication logic
│   │   └── oauth.py           # OAuth integration
│   ├── services/
│   │   ├── __init__.py
│   │   ├── user_service.py    # User business logic
│   │   ├── expense_service.py # Expense business logic
│   │   ├── transaction_service.py # Transaction business logic
│   │   ├── asset_service.py   # Asset business logic
│   │   ├── portfolio_service.py # Portfolio business logic
│   │   └── ml_service.py      # ML prediction service
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── email.py           # Email utilities
│   │   └── helpers.py         # Helper functions
│   └── ml/
│       ├── __init__.py
│       ├── models.py          # ML model definitions
│       └── predictions.py     # Prediction logic
├── alembic/
│   ├── versions/              # Database migration files
│   ├── env.py
│   └── alembic.ini
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_users.py
│   ├── test_expenses.py
│   └── test_transactions.py
├── requirements.txt
├── requirements-dev.txt
├── .env.example
├── .env
├── alembic.ini
├── main.py                    # Entry point
└── README.md
```

### Naming Conventions

#### Files & Directories
- **snake_case** for Python files and directories
- **PascalCase** for class names
- **camelCase** for function names (optional, snake_case preferred)
- **UPPER_CASE** for constants

#### Database
- **snake_case** for table names and columns
- **plural** for table names (users, expenses, transactions)
- **singular** for model class names (User, Expense, Transaction)

#### API Endpoints
- **kebab-case** for URL paths (`/api/v1/user-profile`)
- **snake_case** for query parameters (`user_id`, `month`)
- **camelCase** for JSON request/response fields (optional, snake_case preferred)

#### Code Structure
- **Models**: SQLAlchemy ORM models
- **Schemas**: Pydantic models for request/response validation
- **Services**: Business logic layer
- **API**: Route handlers (thin controllers)
- **Core**: Authentication, security, utilities

---

## Step 3 – Dependencies & Setup

### Required Python Packages

```txt
# Core FastAPI
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6

# Database
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9  # PostgreSQL adapter
asyncpg==0.29.0         # Async PostgreSQL

# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-decouple==3.8
python-dotenv==1.0.0

# OAuth & External Auth
supabase==2.0.2
httpx==0.25.2

# Email
fastapi-mail==1.4.1
jinja2==3.1.2

# Data Processing
pandas==2.1.3
numpy==1.25.2
scikit-learn==1.3.2

# Financial Data
yfinance==0.2.28
requests==2.31.0

# Validation & Serialization
pydantic==2.5.0
pydantic-settings==2.1.0

# CORS & Middleware
fastapi-cors==0.0.6

# Development & Testing
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

### Development Dependencies

```txt
# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
factory-boy==3.3.0

# Code Quality
black==23.11.0
isort==5.12.0
flake8==6.1.0
mypy==1.7.1

# Development Tools
pre-commit==3.6.0
```

### Environment Variables (.env.example)

```env
# Application
APP_NAME=Wealthify Backend
APP_VERSION=1.0.0
DEBUG=True
ENVIRONMENT=development

# Server
HOST=0.0.0.0
PORT=8000
RELOAD=True

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/wealthify
DATABASE_URL_ASYNC=postgresql+asyncpg://username:password@localhost:5432/wealthify

# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# OAuth & External Services
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Configuration
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_FROM=noreply@wealthify.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=Wealthify

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000

# ML Models
ML_MODEL_PATH=./ml/models/
BUDGET_MODEL_PATH=./ml/budget_model.pkl

# Financial Data
YAHOO_FINANCE_TIMEOUT=10
```

### Database Setup

#### PostgreSQL Configuration
```sql
-- Create database
CREATE DATABASE wealthify;

-- Create user (optional)
CREATE USER wealthify_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE wealthify TO wealthify_user;
```

#### Database Models (Key Tables)
```python
# Core tables needed:
- users (id, username, email, hashed_password, name, created_at, updated_at)
- expenses (id, user_id, month, categories_json, total_amount, created_at)
- transactions (id, user_id, type, description, amount, category, date, created_at)
- assets (id, user_id, name, symbol, type, quantity, buy_price, buy_date, created_at)
- portfolio_snapshots (id, user_id, total_value, timestamp, created_at)
- feedback (id, user_id, message, created_at)
- oauth_accounts (id, user_id, provider, provider_user_id, access_token, refresh_token)
```

---

## Step 4 – Auth & Security Plan

### JWT Authentication Implementation

#### Token Structure
```python
# Access Token Payload
{
    "sub": "user_id",
    "email": "user@example.com",
    "exp": "expiration_timestamp",
    "iat": "issued_at_timestamp",
    "type": "access"
}

# Refresh Token Payload
{
    "sub": "user_id",
    "exp": "expiration_timestamp",
    "iat": "issued_at_timestamp",
    "type": "refresh"
}
```

#### Authentication Flow
1. **Login**: Validate credentials → Generate access + refresh tokens
2. **Token Validation**: Verify JWT signature and expiration
3. **Token Refresh**: Use refresh token to get new access token
4. **Logout**: Invalidate refresh token (add to blacklist)

#### Security Features
- **Password Hashing**: bcrypt with salt rounds
- **Token Expiration**: Short-lived access tokens (30 min), long-lived refresh tokens (7 days)
- **Token Blacklisting**: Redis or database table for invalidated tokens
- **Rate Limiting**: Per-endpoint rate limiting
- **CORS**: Configured for specific origins
- **Input Validation**: Pydantic schemas for all inputs

### OAuth Integration Plan

#### Supabase OAuth Flow
1. **Frontend**: Redirect to Supabase OAuth endpoint
2. **Provider**: Google/GitHub authentication
3. **Callback**: Supabase processes OAuth response
4. **Backend**: Verify Supabase token and sync user data
5. **Session**: Create local session with JWT token

#### OAuth Providers Setup
```python
# Google OAuth
- Client ID and Secret from Google Cloud Console
- Redirect URI: https://your-project.supabase.co/auth/v1/callback
- Scopes: email, profile

# GitHub OAuth
- Client ID and Secret from GitHub OAuth Apps
- Redirect URI: https://your-project.supabase.co/auth/v1/callback
- Scopes: user:email, read:user
```

#### User Data Synchronization
```python
# OAuth User Sync Process
1. Verify Supabase token
2. Extract user info from token
3. Find or create local user record
4. Update OAuth account linking
5. Generate local JWT token
6. Return unified response
```

---

## Step 5 – Migration Guide

### Pre-Migration Checklist

- [ ] **Backup Current Data**: Export all data from current backend
- [ ] **Document Current Issues**: List all known bugs and problems
- [ ] **Set Up Development Environment**: New virtual environment, PostgreSQL
- [ ] **Clone Repository**: Create new branch for migration
- [ ] **Install Dependencies**: All required packages
- [ ] **Configure Environment**: Set up .env file with all variables

### Phase 1: Foundation Setup

#### 1.1 Project Structure
```bash
# Create new backend directory
mkdir wealthify_backend_new
cd wealthify_backend_new

# Create directory structure
mkdir -p app/{config,models,schemas,api/v1,core,services,utils,ml}
mkdir -p tests
mkdir -p alembic/versions
```

#### 1.2 Core Configuration
- [ ] Create `app/config/settings.py` with environment variables
- [ ] Set up database connection in `app/config/database.py`
- [ ] Configure CORS middleware
- [ ] Set up logging configuration

#### 1.3 Database Setup
```bash
# Initialize Alembic
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Run migration
alembic upgrade head
```

### Phase 2: Authentication System

#### 2.1 Core Security
- [ ] Implement JWT token generation and validation
- [ ] Set up password hashing with bcrypt
- [ ] Create authentication dependencies
- [ ] Implement token refresh mechanism

#### 2.2 OAuth Integration
- [ ] Set up Supabase client configuration
- [ ] Implement OAuth token verification
- [ ] Create user synchronization logic
- [ ] Test OAuth flow end-to-end

#### 2.3 Auth Routes
- [ ] Implement `/auth/login` endpoint
- [ ] Implement `/auth/register` endpoint
- [ ] Implement `/auth/validate` endpoint
- [ ] Implement `/auth/me` endpoint
- [ ] Implement `/auth/logout` endpoint
- [ ] Implement `/auth/refresh` endpoint
- [ ] Implement OAuth endpoints

### Phase 3: Core Models & Schemas

#### 3.1 Database Models
- [ ] Create User model with OAuth support
- [ ] Create Expense model
- [ ] Create Transaction model
- [ ] Create Asset model
- [ ] Create PortfolioSnapshot model
- [ ] Create Feedback model
- [ ] Create OAuthAccount model

#### 3.2 Pydantic Schemas
- [ ] Create request/response schemas for all models
- [ ] Implement validation rules
- [ ] Add proper error messages
- [ ] Test schema validation

### Phase 4: Business Logic Services

#### 4.1 User Service
- [ ] User CRUD operations
- [ ] Password management
- [ ] OAuth account linking
- [ ] Profile management

#### 4.2 Financial Services
- [ ] Expense management service
- [ ] Transaction management service
- [ ] Asset management service
- [ ] Portfolio management service

#### 4.3 ML Service
- [ ] Expense prediction logic
- [ ] Savings prediction logic
- [ ] 6-month forecast logic
- [ ] Model loading and caching

### Phase 5: API Routes Implementation

#### 5.1 User Routes
- [ ] Implement `/users/{user_id}/savings-goal` (GET/PUT)
- [ ] Implement `/users/{user_id}/calculate-savings-goal` (POST)
- [ ] Implement `/users/{user_id}/current-savings` (PUT)

#### 5.2 Expense Routes
- [ ] Implement `/expenses/{user_id}` (GET)
- [ ] Implement `/expenses` (POST)
- [ ] Implement `/predict-expense` (POST)
- [ ] Implement `/predict/savings` (POST)
- [ ] Implement `/predict/6-month-forecast` (POST)

#### 5.3 Transaction Routes
- [ ] Implement `/transactions/{user_id}` (GET)
- [ ] Implement `/transactions` (POST)

#### 5.4 Asset Routes
- [ ] Implement `/assets` (GET/POST)
- [ ] Implement `/assets/{asset_id}` (PUT/DELETE)

#### 5.5 Portfolio Routes
- [ ] Implement `/portfolio/overview` (GET)
- [ ] Implement `/portfolio/history` (GET)
- [ ] Implement `/portfolio/snapshot` (POST)

#### 5.6 Dashboard Routes
- [ ] Implement `/dashboard/{user_id}` (GET)

#### 5.7 Feedback Routes
- [ ] Implement `/feedback` (GET/POST)

### Phase 6: Testing & Validation

#### 6.1 Unit Tests
- [ ] Test all services
- [ ] Test authentication logic
- [ ] Test database operations
- [ ] Test ML predictions

#### 6.2 Integration Tests
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test OAuth integration
- [ ] Test error handling

#### 6.3 Frontend Integration Tests
- [ ] Test with actual frontend
- [ ] Verify all API calls work
- [ ] Test authentication flow
- [ ] Test data consistency

### Phase 7: Data Migration

#### 7.1 Data Export
```bash
# Export current data
python export_data.py

# Verify data integrity
python verify_export.py
```

#### 7.2 Data Import
```bash
# Import data to new backend
python import_data.py

# Verify import success
python verify_import.py
```

#### 7.3 Data Validation
- [ ] Verify all users migrated
- [ ] Verify all expenses migrated
- [ ] Verify all transactions migrated
- [ ] Verify all assets migrated
- [ ] Verify all portfolio data migrated

### Phase 8: Deployment & Switchover

#### 8.1 Production Setup
- [ ] Set up production database
- [ ] Configure production environment variables
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (nginx)

#### 8.2 Frontend Configuration
- [ ] Update frontend API base URL
- [ ] Test all functionality
- [ ] Update environment variables
- [ ] Deploy frontend changes

#### 8.3 Monitoring & Rollback Plan
- [ ] Set up application monitoring
- [ ] Set up database monitoring
- [ ] Create rollback procedures
- [ ] Document emergency contacts

### Testing Checklist

#### API Endpoint Testing
- [ ] **Authentication**: All auth endpoints work correctly
- [ ] **User Management**: User CRUD operations
- [ ] **Expenses**: Expense tracking and predictions
- [ ] **Transactions**: Transaction management
- [ ] **Assets**: Asset portfolio management
- [ ] **Portfolio**: Portfolio tracking and snapshots
- [ ] **Dashboard**: Dashboard data aggregation
- [ ] **Feedback**: Feedback submission and retrieval

#### Authentication Testing
- [ ] **JWT Login**: Traditional username/password
- [ ] **OAuth Login**: Google and GitHub OAuth
- [ ] **Token Refresh**: Automatic token renewal
- [ ] **Token Validation**: Proper token verification
- [ ] **Logout**: Proper session termination
- [ ] **Password Reset**: Email-based password reset

#### Data Integrity Testing
- [ ] **User Data**: All user information preserved
- [ ] **Financial Data**: All transactions and expenses intact
- [ ] **Portfolio Data**: All assets and snapshots migrated
- [ ] **Relationships**: All foreign key relationships maintained
- [ ] **Calculations**: All computed values accurate

#### Performance Testing
- [ ] **Response Times**: All endpoints respond within 500ms
- [ ] **Database Queries**: Optimized query performance
- [ ] **Concurrent Users**: Handle multiple simultaneous requests
- [ ] **Memory Usage**: Efficient memory utilization
- [ ] **Error Handling**: Graceful error responses

### Go-Live Checklist

#### Pre-Go-Live
- [ ] **Backup**: Complete backup of old system
- [ ] **Monitoring**: All monitoring systems active
- [ ] **Team**: Support team ready for issues
- [ ] **Documentation**: All procedures documented
- [ ] **Rollback Plan**: Clear rollback procedures

#### Go-Live Steps
1. **Deploy New Backend**: Deploy to production
2. **Update DNS/Proxy**: Point to new backend
3. **Update Frontend**: Deploy frontend with new API URL
4. **Monitor**: Watch for errors and performance issues
5. **Validate**: Test all critical functionality

#### Post-Go-Live
- [ ] **Monitor**: 24-48 hours of intensive monitoring
- [ ] **Support**: Handle any user issues
- [ ] **Optimize**: Performance optimizations if needed
- [ ] **Document**: Document any issues and solutions
- [ ] **Cleanup**: Remove old backend after stability confirmed

---

## 🎯 Success Criteria

### Technical Success
- ✅ All API endpoints return correct responses
- ✅ Authentication works for all methods (JWT + OAuth)
- ✅ Database operations are fast and reliable
- ✅ Error handling is graceful and informative
- ✅ Security measures are properly implemented

### Business Success
- ✅ Users can access all features without issues
- ✅ Financial data is accurate and consistent
- ✅ Performance meets or exceeds previous system
- ✅ No data loss during migration
- ✅ User experience is improved

### Operational Success
- ✅ System is stable and reliable
- ✅ Monitoring and alerting work correctly
- ✅ Support team can handle issues effectively
- ✅ Documentation is complete and accurate
- ✅ Rollback procedures are tested and ready

---

## 📞 Support & Resources

### Emergency Contacts
- **Lead Developer**: [Your Name] - [Phone/Email]
- **DevOps**: [DevOps Contact] - [Phone/Email]
- **Database Admin**: [DBA Contact] - [Phone/Email]

### Useful Commands
```bash
# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest tests/ -v

# Database migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head

# Code formatting
black app/
isort app/

# Type checking
mypy app/
```

### Documentation Links
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Supabase Documentation](https://supabase.com/docs)

---

**This migration plan provides a comprehensive roadmap for rebuilding your FastAPI backend from scratch while ensuring your frontend continues to work seamlessly. Follow each phase carefully and test thoroughly before proceeding to the next phase.**
