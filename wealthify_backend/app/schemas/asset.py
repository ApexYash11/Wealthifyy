from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional

class AssetBase(BaseModel):
    """Base asset schema"""
    symbol: str = Field(..., description="Asset symbol (e.g., AAPL, BTC)")
    type: str = Field(..., description="Asset type (e.g., stock, crypto, bond)")
    name: str = Field(..., description="Asset name")
    quantity: Decimal = Field(..., description="Quantity held")
    purchase_price: Decimal = Field(..., description="Price per unit at purchase")
    notes: Optional[str] = Field(None, description="Additional notes")

class AssetCreate(AssetBase):
    """Schema for asset creation"""
    pass

class AssetUpdate(BaseModel):
    """Schema for asset update"""
    quantity: Optional[Decimal] = None
    purchase_price: Optional[Decimal] = None
    notes: Optional[str] = None

class Asset(AssetBase):
    """Schema for asset response"""
    id: str
    user_id: str
    current_price: Decimal
    created_at: datetime
    last_updated: datetime

    class Config:
        from_attributes = True

    def get_total_value(self) -> Decimal:
        """Calculate total value of the asset"""
        return self.quantity * self.current_price

    def get_profit_loss(self) -> Decimal:
        """Calculate profit/loss"""
        return (self.current_price - self.purchase_price) * self.quantity

    def get_profit_loss_percentage(self) -> Decimal:
        """Calculate profit/loss percentage"""
        if self.purchase_price == 0:
            return Decimal(0)
        return ((self.current_price - self.purchase_price) / self.purchase_price) * 100
