from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from supabase.client import Client

from src.models.portfolio import (
    PortfolioSummary,
    PortfolioSnapshot,
    PortfolioAnalytics,
    AssetAllocation,
    PortfolioPerformance
)
from src.models.asset import Asset
from src.services.asset_service import AssetService
from src.utils.logger import log_error, log_info
from src.utils.error_handler import APIError


class PortfolioService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.asset_service = AssetService(supabase)
        self.snapshots_table = "portfolio_snapshots"

    def get_portfolio_summary(self, user_id: str) -> PortfolioSummary:
        """Get current portfolio summary with all assets and their values"""
        return self.asset_service.get_portfolio_summary(user_id)

    def get_portfolio_snapshots(
        self,
        user_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[PortfolioSnapshot]:
        """Get portfolio value snapshots for the given date range"""
        try:
            query = self.supabase.table(self.snapshots_table)\
                .select("*")\
                .eq("user_id", user_id)

            if start_date:
                query = query.gte("timestamp", start_date.isoformat())
            if end_date:
                query = query.lte("timestamp", end_date.isoformat())

            result = query.order("timestamp", desc=False).execute()
            return [PortfolioSnapshot(**item) for item in result.data]
        except Exception as e:
            log_error(e, {
                "user_id": user_id,
                "start_date": start_date,
                "end_date": end_date
            })
            raise APIError("Failed to fetch portfolio snapshots", 500)

    def get_portfolio_analytics(self, user_id: str) -> PortfolioAnalytics:
        """Get portfolio analytics including asset allocation and performance metrics"""
        try:
            # Get current portfolio summary
            summary = self.get_portfolio_summary(user_id)
            
            # Calculate asset allocation
            total_value = summary.total_value
            allocations = []
            
            for asset in summary.assets:
                value = asset.get_total_value()
                percentage = Decimal(
                    (float(value) / float(total_value) * 100)
                    if total_value > 0
                    else 0
                )
                
                allocations.append(AssetAllocation(
                    asset=asset,
                    percentage=percentage,
                    value=value
                ))

            # Get historical performance
            now = datetime.now()
            past_month = now - timedelta(days=30)
            snapshots = self.get_portfolio_snapshots(user_id, past_month, now)
            
            if not snapshots:
                raise APIError("No portfolio history available", 404)

            initial_value = Decimal(str(snapshots[0].total_value))
            final_value = Decimal(str(snapshots[-1].total_value))
            absolute_return = final_value - initial_value
            percentage_return = Decimal(
                (float(absolute_return) / float(initial_value) * 100)
                if initial_value > 0
                else 0
            )
            
            performance = PortfolioPerformance(
                period_start=past_month,
                period_end=now,
                initial_value=initial_value,
                final_value=final_value,
                absolute_return=absolute_return,
                percentage_return=percentage_return
            )

            return PortfolioAnalytics(
                summary=summary,
                allocations=allocations,
                performance=performance
            )
        except APIError:
            raise
        except Exception as e:
            log_error(e, {"user_id": user_id})
            raise APIError("Failed to get portfolio analytics", 500)

    def take_portfolio_snapshot(self, user_id: str) -> PortfolioSnapshot:
        """Take a snapshot of the current portfolio value"""
        return self.asset_service.take_portfolio_snapshot(user_id)
