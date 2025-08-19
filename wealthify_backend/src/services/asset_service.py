from typing import List, Optional, Dict
from datetime import datetime
from decimal import Decimal
import yfinance as yf
from supabase.client import Client
from src.models.asset import Asset, AssetCreate, AssetUpdate
from src.models.portfolio import PortfolioSummary, PortfolioSnapshot
from src.utils.logger import log_error, log_info
from src.utils.error_handler import APIError

class AssetService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.table = "assets"

    def create_asset(self, user_id: str, asset: AssetCreate) -> Asset:
        """Create a new asset"""
        try:
            # Get current price from YFinance
            current_price = self._fetch_current_price(asset.symbol, asset.type)
            
            data = {
                "user_id": user_id,
                **asset.model_dump(),
                "current_price": current_price,
                "last_updated": datetime.now().isoformat(),
                "created_at": datetime.now().isoformat()
            }
            
            result = self.supabase.table(self.table).insert(data).execute()
            return Asset(**result.data[0])
        except Exception as e:
            log_error(e, {"user_id": user_id, "asset": asset.model_dump()})
            raise APIError("Failed to create asset", 500)

    def get_assets(self, user_id: str) -> List[Asset]:
        """Get all assets for a user"""
        try:
            result = self.supabase.table(self.table)\
                .select("*")\
                .eq("user_id", user_id)\
                .execute()
            return [Asset(**item) for item in result.data]
        except Exception as e:
            log_error(e, {"user_id": user_id})
            raise APIError("Failed to fetch assets", 500)

    def get_portfolio_summary(self, user_id: str) -> PortfolioSummary:
        """Get portfolio summary with current values"""
        try:
            assets = self.get_assets(user_id)
            
            # Update current prices
            for asset in assets:
                asset.current_price = self._fetch_current_price(
                    asset.symbol,
                    asset.type
                )
            
            total_value = Decimal(sum(asset.get_total_value() for asset in assets))
            total_cost = Decimal(sum(
                asset.quantity * asset.purchase_price
                for asset in assets
            ))
            
            profit_loss = total_value - total_cost
            profit_loss_percentage = Decimal(
                (float(profit_loss) / float(total_cost) * 100)
                if total_cost > 0
                else 0
            )
            
            return PortfolioSummary(
                total_value=total_value,
                total_profit_loss=profit_loss,
                profit_loss_percentage=profit_loss_percentage,
                assets=assets,
                last_updated=datetime.now()
            )
        except Exception as e:
            log_error(e, {"user_id": user_id})
            raise APIError("Failed to get portfolio summary", 500)

    def take_portfolio_snapshot(self, user_id: str) -> PortfolioSnapshot:
        """Take a snapshot of the current portfolio value"""
        try:
            summary = self.get_portfolio_summary(user_id)
            
            snapshot_data = {
                "user_id": user_id,
                "total_value": float(summary.total_value),  # Convert Decimal to float for DB
                "assets_value": {
                    asset.symbol: float(asset.get_total_value())
                    for asset in summary.assets
                },
                "timestamp": datetime.now().isoformat()
            }
            
            result = self.supabase.table("portfolio_snapshots")\
                .insert(snapshot_data)\
                .execute()
                
            return PortfolioSnapshot(**result.data[0])
        except Exception as e:
            log_error(e, {"user_id": user_id})
            raise APIError("Failed to take portfolio snapshot", 500)

    def update_asset(
        self,
        user_id: str,
        asset_id: str,
        asset: AssetUpdate
    ) -> Asset:
        """Update an asset"""
        try:
            current_price = self._fetch_current_price(
                asset.symbol,
                asset.type
            )
            
            data = {
                **asset.model_dump(),
                "current_price": current_price,
                "last_updated": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            result = self.supabase.table(self.table)\
                .update(data)\
                .eq("id", asset_id)\
                .eq("user_id", user_id)\
                .execute()
                
            if not result.data:
                raise APIError("Asset not found", 404)
                
            return Asset(**result.data[0])
        except APIError:
            raise
        except Exception as e:
            log_error(e, {"user_id": user_id, "asset_id": asset_id})
            raise APIError("Failed to update asset", 500)

    def delete_asset(self, user_id: str, asset_id: str) -> bool:
        """Delete an asset"""
        try:
            result = self.supabase.table(self.table)\
                .delete()\
                .eq("id", asset_id)\
                .eq("user_id", user_id)\
                .execute()
                
            if not result.data:
                raise APIError("Asset not found", 404)
                
            return True
        except APIError:
            raise
        except Exception as e:
            log_error(e, {"user_id": user_id, "asset_id": asset_id})
            raise APIError("Failed to delete asset", 500)

    def _fetch_current_price(self, symbol: str, asset_type: str) -> Decimal:
        """Fetch current price from YFinance"""
        try:
            if asset_type == "crypto":
                ticker = yf.Ticker(f"{symbol}-USD")
            else:
                ticker = yf.Ticker(symbol)
                
            price = ticker.info.get("regularMarketPrice")
            return Decimal(str(price)) if price else Decimal(0)
        except Exception as e:
            log_error(e, {"symbol": symbol, "type": asset_type})
            return Decimal(0)
