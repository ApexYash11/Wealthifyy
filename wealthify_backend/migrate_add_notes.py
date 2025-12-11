#!/usr/bin/env python3
"""
Standalone migration script to add the notes column to transactions table.
Run this script directly: python migrate_add_notes.py
"""
import asyncio
import os
import sys
import ssl
from urllib.parse import urlparse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not set in environment variables")
    sys.exit(1)

print(f"🔗 Using database")

# Parse the database URL to detect environment and clean it
parsed_url = urlparse(DATABASE_URL)

# Clean the URL by removing sslmode parameter if present
query_params = []
if parsed_url.query:
    for param in parsed_url.query.split('&'):
        if not param.startswith('sslmode='):
            query_params.append(param)

# Reconstruct clean URL
clean_query = '&'.join(query_params) if query_params else ''
clean_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}"
if clean_query:
    clean_url += f"?{clean_query}"

# Prepare connection arguments
connect_args = {
    "prepared_statement_cache_size": 0,
    "timeout": 30
}

# Check if we need SSL for cloud database
host = parsed_url.hostname or ""
if 'supabase.co' in host:
    print("🔑 Configuring SSL for Supabase")
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ssl_context

async def migrate():
    """Add notes column to transactions table if it doesn't exist."""
    engine = create_async_engine(
        clean_url,
        echo=False,
        connect_args=connect_args,
    )
    
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False
    )
    
    async with AsyncSessionLocal() as session:
        try:
            # Check if the notes column already exists
            result = await session.execute(
                text("""
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'transactions' 
                        AND column_name = 'notes'
                    );
                """)
            )
            
            column_exists = result.scalar()
            
            if column_exists:
                print("✅ Column 'notes' already exists in transactions table")
                await engine.dispose()
                return
            
            # Add the notes column
            print("🔄 Adding 'notes' column to transactions table...")
            await session.execute(
                text("""
                    ALTER TABLE transactions 
                    ADD COLUMN notes VARCHAR(1000) NULL;
                """)
            )
            
            await session.commit()
            print("✅ Successfully added 'notes' column to transactions table")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Migration failed: {str(e)}")
            raise
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate())
