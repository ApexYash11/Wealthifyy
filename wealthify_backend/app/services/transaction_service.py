from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate

class TransactionService:
    def __init__(self, db: Session):
        self.db = db

    def create_transaction(
        self,
        user_id: str,
        transaction: TransactionCreate
    ) -> Transaction:
        """Create a new transaction"""
        try:
            # Create transaction object
            db_transaction = Transaction(
                user_id=user_id,
                **transaction.model_dump()
            )
            
            # Save to database
            self.db.add(db_transaction)
            self.db.commit()
            self.db.refresh(db_transaction)
            
            return db_transaction
        except Exception as e:
            self.db.rollback()
            raise e

    def get_transactions(self, user_id: str) -> List[Transaction]:
        """Get all transactions for a user"""
        return self.db.query(Transaction).filter(
            Transaction.user_id == user_id
        ).all()

    def get_transaction(
        self,
        user_id: str,
        transaction_id: str
    ) -> Optional[Transaction]:
        """Get a specific transaction"""
        return self.db.query(Transaction).filter(
            Transaction.id == transaction_id,
            Transaction.user_id == user_id
        ).first()

    def update_transaction(
        self,
        user_id: str,
        transaction_id: str,
        transaction_update: TransactionUpdate
    ) -> Optional[Transaction]:
        """Update a transaction"""
        try:
            # Get existing transaction
            db_transaction = self.get_transaction(user_id, transaction_id)
            if not db_transaction:
                return None

            # Update fields
            update_data = transaction_update.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_transaction, field, value)

            # Save changes
            self.db.commit()
            self.db.refresh(db_transaction)
            
            return db_transaction
        except Exception as e:
            self.db.rollback()
            raise e

    def delete_transaction(self, user_id: str, transaction_id: str) -> bool:
        """Delete a transaction"""
        try:
            db_transaction = self.get_transaction(user_id, transaction_id)
            if not db_transaction:
                return False

            self.db.delete(db_transaction)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise e
