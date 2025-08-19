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
    notes: Optional[str] = None

class Transaction(TransactionBase):
    """Schema for transaction response"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
