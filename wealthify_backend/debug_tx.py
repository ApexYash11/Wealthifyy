import asyncio
import sys
import os

# Add the current directory to sys.path so we can import app modules
sys.path.append(os.getcwd())

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.transaction import Transaction
from app.models.user import User

async def check_transactions():
    try:
        async with AsyncSessionLocal() as db:
            # Get the user by email
            result = await db.execute(select(User).filter(User.email == 'yashmaheshwari441@gmail.com'))
            user = result.scalars().first()
            if not user:
                print("No user found with email yashmaheshwari441@gmail.com")
                # Fallback to listing all users
                result = await db.execute(select(User))
                users = result.scalars().all()
                print("Available users:")
                for u in users:
                    print(f"ID: {u.id}, Email: {u.email}")
                return

            print(f"User ID: {user.id}, Email: {user.email}")

            # Get all transactions
            result = await db.execute(select(Transaction).filter(Transaction.user_id == user.id))
            transactions = result.scalars().all()
            
            print(f"Found {len(transactions)} transactions.")
            for tx in transactions:
                print(f"ID: {tx.id}, Date: {tx.date}, Amount: {tx.amount}, Type: {tx.type}, Category: {tx.category}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Run the async function
    loop = asyncio.get_event_loop()
    loop.run_until_complete(check_transactions())
