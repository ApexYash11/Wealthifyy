"""
Migration script to add 'notes' column to transactions table
Run this script to update the database schema
"""

import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal, DATABASE_AVAILABLE

async def add_notes_column():
    """Add notes column to transactions table if it doesn't exist"""
    
    if not DATABASE_AVAILABLE or AsyncSessionLocal is None:
        print("❌ Database not available")
        return False
    
    async with AsyncSessionLocal() as db:
        try:
            # Check if column already exists
            check_column_query = """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='transactions' AND column_name='notes'
            """
            result = await db.execute(text(check_column_query))
            column_exists = result.fetchone() is not None
            
            if column_exists:
                print("✅ 'notes' column already exists in transactions table")
                return True
            
            # Add notes column if it doesn't exist
            alter_query = """
            ALTER TABLE transactions
            ADD COLUMN notes VARCHAR(500) NULL
            """
            
            print("📝 Adding 'notes' column to transactions table...")
            await db.execute(text(alter_query))
            await db.commit()
            
            print("✅ Successfully added 'notes' column to transactions table")
            return True
            
        except Exception as e:
            print(f"❌ Error adding notes column: {e}")
            await db.rollback()
            return False

async def main():
    """Run the migration"""
    print("Starting migration: add_notes_to_transactions")
    print("=" * 50)
    
    success = await add_notes_column()
    
    print("=" * 50)
    if success:
        print("✅ Migration completed successfully!")
    else:
        print("❌ Migration failed!")
    
    return success

if __name__ == "__main__":
    result = asyncio.run(main())
    exit(0 if result else 1)
