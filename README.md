# Wealthify

A comprehensive financial management application built with Next.js and FastAPI, featuring robust authentication and real-time financial insights.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Windows (Command Prompt):**
```cmd
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed manual setup instructions.

## ✨ Features

- **🔐 Multi-Auth System**: JWT, OAuth (Google/GitHub), and Supabase authentication
- **💰 Expense Tracking**: Monitor spending across categories with AI insights
- **🎯 Savings Goals**: Smart savings goal calculation and tracking
- **📈 Investment Portfolio**: Real-time portfolio management with Yahoo Finance integration
- **🤖 AI Predictions**: ML-powered expense and savings predictions
- **📊 Financial Dashboard**: Comprehensive financial overview and analytics
- **📱 Responsive Design**: Works seamlessly on all devices
- **🔒 Security**: Enterprise-grade security with proper authentication flows

## 🏗️ Architecture

### Frontend (Next.js 15)
- **NextAuth.js**: Authentication and session management
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern styling
- **Radix UI**: Accessible components
- **Chart.js**: Data visualization
- **React Hook Form**: Form handling with validation

### Backend (FastAPI)
- **JWT Authentication**: Secure token-based auth
- **OAuth Integration**: Google and GitHub OAuth
- **Supabase Auth**: Additional auth provider
- **PostgreSQL/SQLite**: Flexible database options
- **ML Models**: Scikit-learn for financial predictions
- **YFinance**: Real-time market data
- **Pydantic**: Data validation and serialization

## 📱 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔐 Authentication Methods

1. **Traditional Login**: Username/password with JWT tokens
2. **Google OAuth**: One-click Google sign-in
3. **GitHub OAuth**: GitHub account integration
4. **Supabase Auth**: Additional OAuth provider support

## 📊 Key Features

### Financial Management
- Track expenses by category
- Set and monitor savings goals
- Manage investment portfolio
- View financial insights and trends

### AI-Powered Insights
- Expense prediction based on income and history
- Savings goal recommendations
- 6-month financial forecasting
- Smart budget suggestions

### Portfolio Management
- Real-time stock prices via Yahoo Finance
- Portfolio performance tracking
- Asset allocation analysis
- Historical performance data

## 🛠️ Development

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL (or SQLite for development)

### Environment Setup
1. Backend: Copy `wealthify_backend/env-template.txt` to `.env`
2. Frontend: Copy `wealthify_frontend/env-template.txt` to `.env.local`
3. Configure OAuth providers (Google/GitHub)
4. Set up database connection

### Running Locally
```bash
# Backend
cd wealthify_backend
python start.py

# Frontend (new terminal)
cd wealthify_frontend
npm run dev
```

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Comprehensive setup instructions
- [API Documentation](http://localhost:8000/docs) - Interactive API docs
- [Authentication Flow](AUTHENTICATION_FLOW.md) - Auth system details
- [Integration Summary](INTEGRATION_SUMMARY.md) - System integration overview

## 🔒 Security Features

- JWT token authentication
- Secure password hashing (bcrypt)
- CORS protection
- Input validation and sanitization
- Rate limiting
- HTTPS-ready configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Check the [Setup Guide](SETUP_GUIDE.md) for common issues
- Review the [Troubleshooting](SETUP_GUIDE.md#troubleshooting) section
- Open an issue for bugs or feature requests

---

**Built with ❤️ for better financial management** 

