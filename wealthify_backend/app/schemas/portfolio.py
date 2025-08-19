from pydantic import BaseModel
from typing import List, Dict
from decimal import Decimal
from datetime import datetime

class PortfolioSummary(BaseModel):
    """Portfolio summary schema"""
    total_value: Decimal
    total_investments: Decimal
    total_savings: Decimal
    total_assets: Decimal
    total_liabilities: Decimal
    net_worth: Decimal
    monthly_income: Decimal
    monthly_expenses: Decimal
    savings_rate: float

    class Config:
        from_attributes = True

class AssetAllocation(BaseModel):
    """Asset allocation schema"""
    category: str
    value: Decimal
    percentage: float

class PortfolioPerformance(BaseModel):
    """Portfolio performance schema"""
    time_period: str
    return_percentage: float
    value_change: Decimal

class PortfolioAnalytics(BaseModel):
    """Portfolio analytics schema"""
    asset_allocation: List[AssetAllocation]
    performance: List[PortfolioPerformance]
    risk_metrics: Dict[str, float]
    diversification_score: float

    class Config:
        from_attributes = True

class PortfolioSnapshot(BaseModel):
    """Portfolio snapshot schema"""
    id: str
    user_id: str
    total_value: Decimal
    snapshot_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
