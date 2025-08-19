from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict
from decimal import Decimal
from .asset import Asset

class PortfolioSnapshot(BaseModel):
    id: str = Field(..., description="Snapshot ID")
    user_id: str = Field(..., description="User ID")
    total_value: Decimal = Field(..., description="Total portfolio value")
    assets_value: Dict[str, Decimal] = Field(..., description="Value by asset")
    timestamp: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

class PortfolioSummary(BaseModel):
    total_value: Decimal = Field(..., description="Total portfolio value")
    total_profit_loss: Decimal = Field(..., description="Total profit/loss")
    profit_loss_percentage: Decimal = Field(..., description="Profit/loss percentage")
    assets: List[Asset] = Field(..., description="List of assets")
    last_updated: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

class AssetAllocation(BaseModel):
    """Asset allocation with percentage of portfolio"""
    asset: Asset = Field(..., description="The asset")
    percentage: Decimal = Field(..., description="Percentage of portfolio (0-100)")
    value: Decimal = Field(..., description="Current value of allocation")

    class Config:
        from_attributes = True

class PortfolioPerformance(BaseModel):
    """Portfolio performance metrics for a time period"""
    period_start: datetime = Field(..., description="Start of performance period")
    period_end: datetime = Field(..., description="End of performance period")
    initial_value: Decimal = Field(..., description="Portfolio value at start")
    final_value: Decimal = Field(..., description="Portfolio value at end")
    absolute_return: Decimal = Field(..., description="Absolute return")
    percentage_return: Decimal = Field(..., description="Percentage return")

    class Config:
        from_attributes = True

class PortfolioAnalytics(BaseModel):
    """Complete portfolio analytics including allocation and performance"""
    summary: PortfolioSummary = Field(..., description="Current portfolio summary")
    allocations: List[AssetAllocation] = Field(..., description="Asset allocations")
    performance: PortfolioPerformance = Field(..., description="Performance metrics")

    class Config:
        from_attributes = True
