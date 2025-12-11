from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from typing import Optional


async def get_user_db_id(supabase_user_id: str, db: AsyncSession) -> Optional[int]:
    """
    Map Supabase UUID to database integer ID.
    
    Args:
        supabase_user_id: UUID string from Supabase (e.g., '683bba25-1a40-4542-a208-1fc7d6c11ebf')
        db: Database session
    
    Returns:
        Integer user ID from your users table, or None if not found
    """
    try:
        # Look up user by supabase_id
        result = await db.execute(select(User).filter(User.supabase_id == supabase_user_id))
        db_user = result.scalar_one_or_none()
        
        if db_user:
            return db_user.id  # type: ignore
        else:
            # User not found in local database
            # This might happen if the webhook hasn't synced yet
            return None
    except Exception as e:
        print(f"Error mapping Supabase user ID to database ID: {e}")
        return None


async def ensure_user_exists(supabase_user_data: dict, db: AsyncSession) -> Optional[int]:
    """
    Ensure user exists in local database and return their integer ID.
    
    Args:
        supabase_user_data: Full user object from Supabase
        db: Database session
    
    Returns:
        Integer user ID from your users table
    """
    try:
        supabase_id = supabase_user_data.get("id")
        email = supabase_user_data.get("email")
        
        if not supabase_id or not email:
            return None
        
        # Check if user already exists
        result = await db.execute(select(User).filter(User.supabase_id == supabase_id))
        db_user = result.scalar_one_or_none()
        
        if not db_user:
            # Create new user if doesn't exist
            user_metadata = supabase_user_data.get("user_metadata", {})
            
            db_user = User(
                email=email,
                username=user_metadata.get("name", email.split("@")[0]),
                supabase_id=supabase_id,
                oauth_provider=supabase_user_data.get("app_metadata", {}).get("provider"),
                oauth_id=user_metadata.get("provider_id"),
                avatar_url=user_metadata.get("avatar_url"),
                savings_goal=10000.0,  # Default
                current_savings=0.0,   # Default
            )
            
            db.add(db_user)
            await db.commit()
            await db.refresh(db_user)
        
        return db_user.id  # type: ignore
        
    except Exception as e:
        print(f"Error ensuring user exists: {e}")
        await db.rollback()
        return None
