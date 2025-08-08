#!/bin/bash

# Wealthify Setup Script
# This script helps you set up the Wealthify application quickly

set -e

echo "🎯 Wealthify Setup Script"
echo "=========================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd wealthify_backend

# Create virtual environment if it doesn't exist
if [ ! -d "env" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv env
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source env/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env-template.txt .env
    echo "⚠️  Please edit wealthify_backend/.env with your configuration"
else
    echo "✅ .env file already exists"
fi

cd ..

# Setup Frontend
echo ""
echo "🔧 Setting up Frontend..."
cd wealthify_frontend

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file from template..."
    cp env-template.txt .env.local
    echo "⚠️  Please edit wealthify_frontend/.env.local with your configuration"
else
    echo "✅ .env.local file already exists"
fi

cd ..

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit wealthify_backend/.env with your configuration"
echo "2. Edit wealthify_frontend/.env.local with your configuration"
echo "3. Start the backend: cd wealthify_backend && python start.py"
echo "4. Start the frontend: cd wealthify_frontend && npm run dev"
echo ""
echo "📚 For detailed setup instructions, see SETUP_GUIDE.md"
echo ""
echo "🌐 Access points:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"
