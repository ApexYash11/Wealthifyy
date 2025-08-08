# Wealthify Setup Script for Windows PowerShell
# This script helps you set up the Wealthify application quickly

Write-Host "🎯 Wealthify Setup Script" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python 3.8+ first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version 2>&1
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green

# Setup Backend
Write-Host ""
Write-Host "🔧 Setting up Backend..." -ForegroundColor Yellow
Set-Location wealthify_backend

# Create virtual environment if it doesn't exist
if (-not (Test-Path "env")) {
    Write-Host "📦 Creating Python virtual environment..." -ForegroundColor Cyan
    python -m venv env
}

# Activate virtual environment
Write-Host "🔌 Activating virtual environment..." -ForegroundColor Cyan
& "env\Scripts\Activate.ps1"

# Install dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Cyan
    Copy-Item env-template.txt .env
    Write-Host "⚠️  Please edit wealthify_backend\.env with your configuration" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Set-Location ..

# Setup Frontend
Write-Host ""
Write-Host "🔧 Setting up Frontend..." -ForegroundColor Yellow
Set-Location wealthify_frontend

# Install dependencies
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Cyan
npm install

# Create .env.local file if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file from template..." -ForegroundColor Cyan
    Copy-Item env-template.txt .env.local
    Write-Host "⚠️  Please edit wealthify_frontend\.env.local with your configuration" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local file already exists" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "🎉 Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit wealthify_backend\.env with your configuration" -ForegroundColor White
Write-Host "2. Edit wealthify_frontend\.env.local with your configuration" -ForegroundColor White
Write-Host "3. Start the backend: cd wealthify_backend && python start.py" -ForegroundColor White
Write-Host "4. Start the frontend: cd wealthify_frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed setup instructions, see SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Access points:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "- API Docs: http://localhost:8000/docs" -ForegroundColor White

Read-Host "Press Enter to exit"
