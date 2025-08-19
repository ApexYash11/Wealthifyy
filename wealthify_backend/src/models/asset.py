from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal
from decimal import Decimal

class AssetBase(BaseModel):
    name: str = Field(..., description="Asset name")
    symbol: str = Field(..., description="Asset symbol")
    type: Literal["crypto", "stock", "etf", "other"] = Field(..., description="Asset type")
    quantity: Decimal = Field(..., description="Asset quantity")
    purchase_price: Decimal = Field(..., description="Purchase price per unit")
    purchase_date: datetime = Field(..., description="Purchase date")

class AssetCreate(AssetBase):
    pass

class AssetUpdate(AssetBase):
    pass

class Asset(AssetBase):
    id: str = Field(..., description="Asset ID")
    user_id: str = Field(..., description="User ID")
    current_price: Optional[Decimal] = Field(None, description="Current price per unit")
    last_updated: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    def get_total_value(self) -> Decimal:
        """Calculate total current value of the asset"""
        price = self.current_price or self.purchase_price
        return self.quantity * price

    def get_profit_loss(self) -> Decimal:
        """Calculate total profit/loss"""
        if not self.current_price:
            return Decimal(0)
        return (self.current_price - self.purchase_price) * self.quantity
