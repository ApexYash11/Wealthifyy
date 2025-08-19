from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from decimal import Decimal

class ExpenseBase(BaseModel):
    category: str = Field(..., description="Expense category")
    amount: Decimal = Field(..., description="Expense amount")
    description: Optional[str] = Field(None, description="Expense description")
    date: datetime = Field(default_factory=datetime.now, description="Expense date")
    recurring: bool = Field(default=False, description="Whether this is a recurring expense")

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: str = Field(..., description="Expense ID")
    user_id: str = Field(..., description="User ID")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
