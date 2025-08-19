from decimal import Decimal
from typing import Dict, List
from datetime import datetime, timedelta
import uuid
from sqlalchemy import and_
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import get_attribute
from app.models.asset import Asset
from app.models.transaction import Transaction
from app.schemas.portfolio import PortfolioSummary, PortfolioAnalytics, AssetAllocation, PortfolioPerformance, PortfolioSnapshot

class PortfolioService:
    def __init__(self, db: Session):
        self.db = db

    def get_portfolio_summary(self, user_id: str) -> PortfolioSummary:
        """Get portfolio summary"""
        try:
            # Get all assets and transactions
            assets = self.db.query(Asset).filter(Asset.user_id == user_id).all()
            month_ago = datetime.now() - timedelta(days=30)
            transactions = self.db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.date >= month_ago
            ).all()
            
            # Calculate totals
            total_value = Decimal('0')
            total_investments = Decimal('0')
            total_savings = Decimal('0')
            total_assets = Decimal('0')
            total_liabilities = Decimal('0')
            monthly_income = Decimal('0')
            monthly_expenses = Decimal('0')
            
            # Calculate from assets
            for asset in assets:
                value = Decimal(str(asset.quantity)) * Decimal(str(asset.current_price))
                total_value += value
                asset_type = str(get_attribute(asset, 'type'))
                
                if asset_type == 'investment':
                    total_investments += value
                elif asset_type == 'savings':
                    total_savings += value
                
                if asset_type != 'liability':
                    total_assets += value
                else:
                    total_liabilities += value
            
            # Calculate from transactions
            for transaction in transactions:
                amount = Decimal(str(transaction.amount))
                trans_type = str(get_attribute(transaction, 'type'))
                
                if trans_type == 'income':
                    monthly_income += amount
                elif trans_type == 'expense':
                    monthly_expenses += amount
            
            # Calculate derived metrics
            net_worth = total_assets - total_liabilities
            savings_rate = float(0)
            if monthly_income > Decimal('0'):
                savings_rate = float((monthly_income - monthly_expenses) / monthly_income)

            return PortfolioSummary(
                total_value=total_value,
                total_investments=total_investments,
                total_savings=total_savings,
                total_assets=total_assets,
                total_liabilities=total_liabilities,
                net_worth=net_worth,
                monthly_income=monthly_income,
                monthly_expenses=monthly_expenses,
                savings_rate=savings_rate
            )
        except Exception as e:
            raise e

    def get_portfolio_analytics(self, user_id: str) -> PortfolioAnalytics:
        """Get portfolio analytics"""
        try:
            # Get all assets
            assets = self.db.query(Asset).filter(Asset.user_id == user_id).all()
            
            # Calculate asset allocation
            total_value = Decimal('0')
            allocation = {}
            
            for asset in assets:
                value = Decimal(str(asset.quantity)) * Decimal(str(asset.current_price))
                total_value += value
                asset_type = str(get_attribute(asset, 'type'))
                
                if asset_type not in allocation:
                    allocation[asset_type] = Decimal('0')
                allocation[asset_type] += value

            # Convert to AssetAllocation objects
            asset_allocation = []
            for category, value in allocation.items():
                percentage = float(value / total_value * 100) if total_value > 0 else 0
                asset_allocation.append(AssetAllocation(
                    category=category,
                    value=value,
                    percentage=percentage
                ))

            # Calculate performance metrics
            performance = [
                PortfolioPerformance(
                    time_period="1M",
                    return_percentage=5.2,  # Example values
                    value_change=Decimal('1000')
                ),
                PortfolioPerformance(
                    time_period="3M",
                    return_percentage=12.5,
                    value_change=Decimal('2500')
                ),
                PortfolioPerformance(
                    time_period="1Y",
                    return_percentage=25.0,
                    value_change=Decimal('5000')
                )
            ]

            # Calculate risk metrics
            risk_metrics = {
                "volatility": 12.5,
                "sharpe_ratio": 1.8,
                "beta": 0.85
            }

            # Calculate diversification score (example implementation)
            diversification_score = min(len(allocation) * 10, 100)

            return PortfolioAnalytics(
                asset_allocation=asset_allocation,
                performance=performance,
                risk_metrics=risk_metrics,
                diversification_score=float(diversification_score)
            )
        except Exception as e:
            raise e

    def take_portfolio_snapshot(self, user_id: str) -> PortfolioSnapshot:
        """Take a snapshot of current portfolio value"""
        try:
            total_value = Decimal('0')
            assets = self.db.query(Asset).filter(Asset.user_id == user_id).all()
            
            for asset in assets:
                value = Decimal(str(asset.quantity)) * Decimal(str(asset.current_price))
                total_value += value

            snapshot = PortfolioSnapshot(
                id=str(uuid.uuid4()),
                user_id=user_id,
                total_value=total_value,
                snapshot_date=datetime.now(),
                created_at=datetime.now()
            )
            
            # Here you would typically save the snapshot to the database
            # self.db.add(snapshot)
            # self.db.commit()
            
            return snapshot
        except Exception as e:
            raise e

    def get_portfolio_snapshots(
        self,
        user_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[PortfolioSnapshot]:
        """Get portfolio snapshots for a date range"""
        try:
            # Here you would typically query the snapshots from the database
            # Example implementation returning mock data
            snapshots = []
            current_date = start_date
            
            while current_date <= end_date:
                snapshots.append(PortfolioSnapshot(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    total_value=Decimal('10000'),  # Example value
                    snapshot_date=current_date,
                    created_at=current_date
                ))
                current_date += timedelta(days=1)
            
            return snapshots
        except Exception as e:
            raise e
