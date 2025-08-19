from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from supabase.client import Client
from src.models.expense import Expense, ExpenseCreate, ExpenseUpdate
from src.utils.logger import log_error, log_info
from src.utils.error_handler import APIError

class ExpenseService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.table = "expenses"

    async def create_expense(self, user_id: str, expense: ExpenseCreate) -> Expense:
        """Create a new expense"""
        try:
            data = {
                "user_id": user_id,
                **expense.model_dump(),
                "created_at": datetime.now().isoformat()
            }
            
            result = await self.supabase.table(self.table).insert(data).execute()
            return Expense(**result.data[0])
        except Exception as e:
            log_error(e, {"user_id": user_id, "expense": expense.model_dump()})
            raise APIError("Failed to create expense", 500)

    async def get_expenses(
        self,
        user_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Expense]:
        """Get user expenses with optional date range"""
        try:
            query = self.supabase.table(self.table).select("*").eq("user_id", user_id)
            
            if start_date:
                query = query.gte("date", start_date.isoformat())
            if end_date:
                query = query.lte("date", end_date.isoformat())
                
            result = await query.execute()
            return [Expense(**item) for item in result.data]
        except Exception as e:
            log_error(e, {"user_id": user_id})
            raise APIError("Failed to fetch expenses", 500)

    async def update_expense(self, user_id: str, expense_id: str, expense: ExpenseUpdate) -> Expense:
        """Update an expense"""
        try:
            data = {
                **expense.model_dump(),
                "updated_at": datetime.now().isoformat()
            }
            
            result = await self.supabase.table(self.table)\
                .update(data)\
                .eq("id", expense_id)\
                .eq("user_id", user_id)\
                .execute()
                
            if not result.data:
                raise APIError("Expense not found", 404)
                
            return Expense(**result.data[0])
        except APIError:
            raise
        except Exception as e:
            log_error(e, {"user_id": user_id, "expense_id": expense_id})
            raise APIError("Failed to update expense", 500)

    async def delete_expense(self, user_id: str, expense_id: str) -> bool:
        """Delete an expense"""
        try:
            result = await self.supabase.table(self.table)\
                .delete()\
                .eq("id", expense_id)\
                .eq("user_id", user_id)\
                .execute()
                
            if not result.data:
                raise APIError("Expense not found", 404)
                
            return True
        except APIError:
            raise
        except Exception as e:
            log_error(e, {"user_id": user_id, "expense_id": expense_id})
            raise APIError("Failed to delete expense", 500)

    async def get_monthly_total(self, user_id: str, month: int, year: int) -> Decimal:
        """Get total expenses for a specific month"""
        try:
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)
            
            result = await self.supabase.table(self.table)\
                .select("amount")\
                .eq("user_id", user_id)\
                .gte("date", start_date.isoformat())\
                .lt("date", end_date.isoformat())\
                .execute()
                
            return sum(Decimal(str(item["amount"])) for item in result.data)
