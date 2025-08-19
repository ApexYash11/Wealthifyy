from typing import List, Optional, Dict
from datetime import datetime
from decimal import Decimal
from supabase.client import Client
from src.models.transaction import Transaction, TransactionCreate, TransactionUpdate
from src.utils.logger import log_error, log_info
from src.utils.error_handler import APIError

class TransactionService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.table = "transactions"

    async def create_transaction(self, user_id: str, transaction: TransactionCreate) -> Transaction:
        """Create a new transaction"""
        try:
            data = {
                "user_id": user_id,
                **transaction.model_dump(),
                "created_at": datetime.now().isoformat()
            }
            
            result = await self.supabase.table(self.table).insert(data).execute()
            return Transaction(**result.data[0])
        except Exception as e:
            log_error(e, {"user_id": user_id, "transaction": transaction.model_dump()})
            raise APIError("Failed to create transaction", 500)

    async def get_transactions(
        self,
        user_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        transaction_type: Optional[str] = None
    ) -> List[Transaction]:
        """Get user transactions with optional filters"""
        try:
            query = self.supabase.table(self.table).select("*").eq("user_id", user_id)
            
            if start_date:
                query = query.gte("date", start_date.isoformat())
            if end_date:
                query = query.lte("date", end_date.isoformat())
            if transaction_type:
                query = query.eq("type", transaction_type)
                
            result = await query.execute()
            return [Transaction(**item) for item in result.data]
        except Exception as e:
            log_error(e, {"user_id": user_id})
            raise APIError("Failed to fetch transactions", 500)

    async def get_transaction_summary(
        self,
        user_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Decimal]:
        """Get summary of income and expenses for a date range"""
        try:
            transactions = await self.get_transactions(user_id, start_date, end_date)
            
            income = sum(
                Decimal(str(t.amount))
                for t in transactions
                if t.type == "income"
            )
            
            expenses = sum(
                Decimal(str(t.amount))
                for t in transactions
                if t.type == "expense"
            )
            
            return {
                "income": income,
                "expenses": expenses,
                "net": income - expenses
            }
        except Exception as e:
            log_error(e, {"user_id": user_id})
            raise APIError("Failed to get transaction summary", 500)

    async def update_transaction(
        self,
        user_id: str,
        transaction_id: str,
        transaction: TransactionUpdate
    ) -> Transaction:
        """Update a transaction"""
        try:
            data = {
                **transaction.model_dump(),
                "updated_at": datetime.now().isoformat()
            }
            
            result = await self.supabase.table(self.table)\
                .update(data)\
                .eq("id", transaction_id)\
                .eq("user_id", user_id)\
                .execute()
                
            if not result.data:
                raise APIError("Transaction not found", 404)
                
            return Transaction(**result.data[0])
        except APIError:
            raise
        except Exception as e:
            log_error(e, {"user_id": user_id, "transaction_id": transaction_id})
            raise APIError("Failed to update transaction", 500)

    async def delete_transaction(self, user_id: str, transaction_id: str) -> bool:
        """Delete a transaction"""
        try:
            result = await self.supabase.table(self.table)\
                .delete()\
                .eq("id", transaction_id)\
                .eq("user_id", user_id)\
                .execute()
                
            if not result.data:
                raise APIError("Transaction not found", 404)
                
            return True
        except APIError:
            raise
        except Exception as e:
            log_error(e, {"user_id": user_id, "transaction_id": transaction_id})
            raise APIError("Failed to delete transaction", 500)
