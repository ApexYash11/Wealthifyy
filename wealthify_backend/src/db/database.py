from supabase import create_client, Client
from fastapi import HTTPException
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise EnvironmentError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

try:
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    raise Exception(f"Failed to initialize Supabase client: {str(e)}")

async def get_supabase() -> Client:
    """
    Dependency to get Supabase client
    """
    try:
        # Test the connection
        await supabase.auth.get_user()
        return supabase
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database connection error: {str(e)}"
        )
