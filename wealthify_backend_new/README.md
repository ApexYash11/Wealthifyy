# Wealthify Backend

A modern FastAPI backend for the Wealthify financial management application.

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip or poetry

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wealthify_backend_new
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb wealthify
   
   # Initialize Alembic
   alembic init alembic
   
   # Create initial migration
   alembic revision --autogenerate -m "Initial migration"
   
   # Run migration
   alembic upgrade head
   ```

6. **Run the application**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📁 Project Structure

```
wealthify_backend_new/
├── app/
│   ├── config/          # Configuration files
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── api/v1/          # API routes
│   ├── core/            # Core functionality (auth, security)
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── ml/              # Machine learning models
├── tests/               # Test suite
├── alembic/             # Database migrations
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/wealthify

# Security
SECRET_KEY=your-super-secret-key-here

# OAuth (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Email
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
```

## 🗄️ Database

### Models

- **User**: User accounts and authentication
- **Expense**: Monthly expense tracking
- **Transaction**: Individual transactions
- **Asset**: Investment portfolio assets
- **PortfolioSnapshot**: Portfolio value history
- **Feedback**: User feedback
- **OAuthAccount**: OAuth provider accounts

### Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 🔐 Authentication

### JWT Authentication

- Access tokens (30 minutes)
- Refresh tokens (7 days)
- Password hashing with bcrypt

### OAuth Integration

- Google OAuth via Supabase
- GitHub OAuth via Supabase
- Automatic user synchronization

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - Login with username/password
- `POST /auth/register` - Register new user
- `POST /auth/validate` - Validate JWT token
- `GET /auth/me` - Get current user info
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Users
- `GET /users/{user_id}/savings-goal` - Get savings goal
- `PUT /users/{user_id}/savings-goal` - Update savings goal
- `POST /users/{user_id}/calculate-savings-goal` - Calculate smart goal
- `PUT /users/{user_id}/current-savings` - Update current savings

### Expenses
- `GET /expenses/{user_id}` - Get user expenses
- `POST /expenses` - Add expenses
- `POST /predict-expense` - Predict expenses

### Transactions
- `GET /transactions/{user_id}` - Get user transactions
- `POST /transactions` - Add transaction

### Assets
- `GET /assets` - Get user assets
- `POST /assets` - Add asset
- `PUT /assets/{asset_id}` - Update asset
- `DELETE /assets/{asset_id}` - Delete asset

### Portfolio
- `GET /portfolio/overview` - Get portfolio overview
- `GET /portfolio/history` - Get portfolio history
- `POST /portfolio/snapshot` - Take portfolio snapshot

### Dashboard
- `GET /dashboard/{user_id}` - Get dashboard data

### Predictions
- `POST /predict/savings` - Predict savings
- `POST /predict/6-month-forecast` - 6-month forecast

### Feedback
- `GET /feedback` - Get feedback
- `POST /feedback` - Submit feedback

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

### Test Structure

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test API endpoints
- **E2E Tests**: Test complete user flows

## 🚀 Deployment

### Development

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production

```bash
# Using Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Using Docker
docker build -t wealthify-backend .
docker run -p 8000:8000 wealthify-backend
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:8000/health
```

### Logs

Application logs are configured to output to stdout/stderr for containerized deployments.

## 🔧 Development

### Code Formatting

```bash
# Format code
black app/
isort app/

# Type checking
mypy app/
```

### Pre-commit Hooks

```bash
# Install pre-commit
pre-commit install

# Run manually
pre-commit run --all-files
```

## 📚 Documentation

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.
