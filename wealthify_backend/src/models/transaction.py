from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal
from decimal import Decimal

class TransactionBase(BaseModel):
    type: Literal["income", "expense"] = Field(..., description="Transaction type")
    amount: Decimal = Field(..., description="Transaction amount")
    category: str = Field(..., description="Transaction category")
    description: Optional[str] = Field(None, description="Transaction description")
    date: datetime = Field(default_factory=datetime.now, description="Transaction date")

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: str = Field(..., description="Transaction ID")
    user_id: str = Field(..., description="User ID")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
