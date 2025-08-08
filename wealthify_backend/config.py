import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL")

# Default values
DEFAULT_SAVINGS_GOAL = float(os.getenv("DEFAULT_SAVINGS_GOAL", "10000.0"))
DEFAULT_SAVINGS_RATE = float(os.getenv("DEFAULT_SAVINGS_RATE", "0.2"))
EMERGENCY_FUND_MONTHS = int(os.getenv("EMERGENCY_FUND_MONTHS", "3")) 