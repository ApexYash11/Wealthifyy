from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.get_current_user_supabase import get_current_user
from app.schemas.asset import AssetCreate, AssetUpdate, Asset
from app.services.asset_service import AssetService
from app.models.user import User
from app.core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.post("/", response_model=Asset)
async def create_asset(
    asset_data: AssetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new asset"""
    asset_service = AssetService(db)
    return asset_service.create_asset(str(current_user.id), asset_data)

@router.get("/", response_model=List[Asset])
async def get_assets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all user assets"""
    asset_service = AssetService(db)
    return asset_service.get_assets(str(current_user.id))

@router.get("/{asset_id}", response_model=Asset)
async def get_asset(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific asset"""
    asset_service = AssetService(db)
    asset = asset_service.get_asset(str(current_user.id), asset_id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    return asset

@router.put("/{asset_id}", response_model=Asset)
async def update_asset(
    asset_id: str,
    asset_data: AssetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an asset"""
    asset_service = AssetService(db)
    updated_asset = asset_service.update_asset(str(current_user.id), asset_id, asset_data)
    if not updated_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    return updated_asset

@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an asset"""
    asset_service = AssetService(db)
    success = asset_service.delete_asset(str(current_user.id), asset_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    return {"message": "Asset deleted successfully"}
