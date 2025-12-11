from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate

class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_transaction(
        self,
        user_id: str,
        transaction: TransactionCreate
    ) -> Transaction:
        """Create a new transaction"""
        try:
            data = transaction.model_dump()
            
            # Handle date timezone - ensure it's naive for Postgres TIMESTAMP WITHOUT TIME ZONE
            tx_date = data.get("date")
            if tx_date and tx_date.tzinfo:
                tx_date = tx_date.replace(tzinfo=None)
                
            # Convert Decimal to float for SQLAlchemy Float column
            amount = data.get("amount")
            if amount is not None:
                amount = float(amount)

            db_transaction = Transaction(
                user_id=int(user_id),
                type=data.get("type"),
                description=data.get("description"),
                amount=amount,
                category=data.get("category"),
                date=tx_date,
                recurring=data.get("recurring", False),
                notes=data.get("notes"),
                created_at=datetime.now()
            )
            self.db.add(db_transaction)
            await self.db.commit()
            await self.db.refresh(db_transaction)
            return db_transaction
        except Exception as e:
            await self.db.rollback()
            raise e

    async def get_transactions(self, user_id: str) -> List[Transaction]:
        """Get all transactions for a user"""
        result = await self.db.execute(
            select(Transaction).filter(Transaction.user_id == int(user_id))
        )
        return list(result.scalars().all())

    async def get_transaction(
        self,
        user_id: str,
        transaction_id: str
    ) -> Optional[Transaction]:
        """Get a specific transaction"""
        result = await self.db.execute(
            select(Transaction).filter(
                Transaction.id == int(transaction_id),
                Transaction.user_id == int(user_id)
            )
        )
        return result.scalars().first()

    async def update_transaction(
        self,
        user_id: str,
        transaction_id: str,
        transaction_update: TransactionUpdate
    ) -> Optional[Transaction]:
        """Update a transaction"""
        try:
            db_transaction = await self.get_transaction(user_id, transaction_id)
            if not db_transaction:
                return None

            update_data = transaction_update.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_transaction, field, value)

            await self.db.commit()
            await self.db.refresh(db_transaction)
            return db_transaction
        except Exception as e:
            await self.db.rollback()
            raise e

    async def delete_transaction(self, user_id: str, transaction_id: str) -> bool:
        """Delete a transaction"""
        try:
            db_transaction = await self.get_transaction(user_id, transaction_id)
            if not db_transaction:
                return False

            await self.db.delete(db_transaction)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            raise e
