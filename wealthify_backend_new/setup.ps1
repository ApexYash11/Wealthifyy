# Wealthify Backend Setup Script for Windows
# This script sets up the new FastAPI backend from scratch

Write-Host "🚀 Wealthify Backend Setup Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Check if pip is installed
Write-Host "Checking pip installation..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version
    Write-Host "✅ pip found: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pip not found. Please install pip first." -ForegroundColor Red
    exit 1
}

# Create virtual environment
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "⚠️  Virtual environment already exists. Removing..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "venv"
}

python -m venv venv
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Virtual environment created successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
    exit 1
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to activate virtual environment" -ForegroundColor Red
    exit 1
}

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ pip upgraded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to upgrade pip" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
Write-Host "Setting up environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Created .env file from template" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env file with your configuration" -ForegroundColor Yellow
    } else {
        Write-Host "❌ env.example not found" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Create necessary directories
Write-Host "Creating project directories..." -ForegroundColor Yellow
$directories = @(
    "app\config",
    "app\models", 
    "app\schemas",
    "app\api\v1",
    "app\core",
    "app\services",
    "app\utils",
    "app\ml",
    "tests",
    "alembic\versions"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    }
}

# Create __init__.py files
Write-Host "Creating __init__.py files..." -ForegroundColor Yellow
$initFiles = @(
    "app\__init__.py",
    "app\config\__init__.py",
    "app\models\__init__.py",
    "app\schemas\__init__.py",
    "app\api\__init__.py",
    "app\api\v1\__init__.py",
    "app\core\__init__.py",
    "app\services\__init__.py",
    "app\utils\__init__.py",
    "app\ml\__init__.py",
    "tests\__init__.py"
)

foreach ($file in $initFiles) {
    if (-not (Test-Path $file)) {
        New-Item -ItemType File -Path $file -Force | Out-Null
        Write-Host "✅ Created file: $file" -ForegroundColor Green
    }
}

# Initialize Alembic if not already done
Write-Host "Setting up database migrations..." -ForegroundColor Yellow
if (-not (Test-Path "alembic.ini")) {
    alembic init alembic
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Alembic initialized successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to initialize Alembic" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Alembic already initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "2. Set up PostgreSQL database" -ForegroundColor White
Write-Host "3. Run: alembic revision --autogenerate -m 'Initial migration'" -ForegroundColor White
Write-Host "4. Run: alembic upgrade head" -ForegroundColor White
Write-Host "5. Run: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see README.md" -ForegroundColor Cyan
