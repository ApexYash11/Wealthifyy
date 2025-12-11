from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional

class TransactionBase(BaseModel):
    """Base transaction schema"""
    amount: Decimal = Field(..., description="Transaction amount")
    category: str = Field(..., description="Transaction category")
    description: str = Field(..., description="Transaction description")
    type: str = Field(..., description="Transaction type (income/expense)")
    date: datetime = Field(default_factory=datetime.now, description="Transaction date")
    recurring: Optional[bool] = Field(False, description="Whether transaction is recurring")
    notes: Optional[str] = Field(None, description="Additional notes")

class TransactionCreate(TransactionBase):
    """Schema for transaction creation"""
    pass

class TransactionUpdate(BaseModel):
    """Schema for transaction update"""
    amount: Optional[Decimal] = None
    category: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    date: Optional[datetime] = None
    recurring: Optional[bool] = None
    notes: Optional[str] = None

class Transaction(TransactionBase):
    """Schema for transaction response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
