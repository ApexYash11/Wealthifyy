from typing import List, Optional
from datetime import datetime
from decimal import Decimal
import yfinance as yf
from sqlalchemy.orm import Session
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate

class AssetService:
    def __init__(self, db: Session):
        self.db = db

    def create_asset(self, user_id: str, asset: AssetCreate) -> Asset:
        """Create a new asset"""
        try:
            # Get current price from YFinance
            current_price = self._fetch_current_price(asset.symbol, asset.type)
            
            # Create asset object
            db_asset = Asset(
                user_id=user_id,
                current_price=current_price,
                last_updated=datetime.now(),
                **asset.model_dump()
            )
            
            # Save to database
            self.db.add(db_asset)
            self.db.commit()
            self.db.refresh(db_asset)
            
            return db_asset
        except Exception as e:
            self.db.rollback()
            raise e

    def get_assets(self, user_id: str) -> List[Asset]:
        """Get all assets for a user"""
        return self.db.query(Asset).filter(Asset.user_id == user_id).all()

    def get_asset(self, user_id: str, asset_id: str) -> Optional[Asset]:
        """Get a specific asset"""
        return self.db.query(Asset).filter(
            Asset.id == asset_id,
            Asset.user_id == user_id
        ).first()

    def update_asset(
        self,
        user_id: str,
        asset_id: str,
        asset_update: AssetUpdate
    ) -> Optional[Asset]:
        """Update an asset"""
        try:
            # Get existing asset
            db_asset = self.get_asset(user_id, asset_id)
            if not db_asset:
                return None

            # Update fields
            update_data = asset_update.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_asset, field, value)

            # Update current price
            current_price = self._fetch_current_price(
                str(db_asset.symbol),
                str(db_asset.type)
            )
            setattr(db_asset, 'current_price', current_price)
            setattr(db_asset, 'last_updated', datetime.now())

            # Save changes
            self.db.commit()
            self.db.refresh(db_asset)
            
            return db_asset
        except Exception as e:
            self.db.rollback()
            raise e

    def delete_asset(self, user_id: str, asset_id: str) -> bool:
        """Delete an asset"""
        try:
            db_asset = self.get_asset(user_id, asset_id)
            if not db_asset:
                return False

            self.db.delete(db_asset)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise e

    def _fetch_current_price(self, symbol: str, asset_type: str) -> float:
        """Fetch current price from YFinance"""
        try:
            if asset_type == "crypto":
                ticker = yf.Ticker(f"{symbol}-USD")
            else:
                ticker = yf.Ticker(symbol)
                
            price = ticker.info.get("regularMarketPrice")
            return float(price) if price else 0.0
        except Exception:
            return 0.0
