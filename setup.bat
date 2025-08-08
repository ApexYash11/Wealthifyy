@echo off
REM Wealthify Setup Script for Windows
REM This script helps you set up the Wealthify application quickly

echo 🎯 Wealthify Setup Script
echo ==========================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup Backend
echo.
echo 🔧 Setting up Backend...
cd wealthify_backend

REM Create virtual environment if it doesn't exist
if not exist "env" (
    echo 📦 Creating Python virtual environment...
    python -m venv env
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call env\Scripts\activate.bat

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy env-template.txt .env
    echo ⚠️  Please edit wealthify_backend\.env with your configuration
) else (
    echo ✅ .env file already exists
)

cd ..

REM Setup Frontend
echo.
echo 🔧 Setting up Frontend...
cd wealthify_frontend

REM Install dependencies
echo 📦 Installing Node.js dependencies...
npm install

REM Create .env.local file if it doesn't exist
if not exist ".env.local" (
    echo 📝 Creating .env.local file from template...
    copy env-template.txt .env.local
    echo ⚠️  Please edit wealthify_frontend\.env.local with your configuration
) else (
    echo ✅ .env.local file already exists
)

cd ..

echo.
echo 🎉 Setup completed!
echo.
echo 📋 Next steps:
echo 1. Edit wealthify_backend\.env with your configuration
echo 2. Edit wealthify_frontend\.env.local with your configuration
echo 3. Start the backend: cd wealthify_backend ^&^& python start.py
echo 4. Start the frontend: cd wealthify_frontend ^&^& npm run dev
echo.
echo 📚 For detailed setup instructions, see SETUP_GUIDE.md
echo.
echo 🌐 Access points:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - API Docs: http://localhost:8000/docs

pause
