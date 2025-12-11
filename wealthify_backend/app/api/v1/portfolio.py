from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.core.get_current_user_supabase import get_current_user
from app.schemas.portfolio import PortfolioSummary, PortfolioAnalytics
from app.services.portfolio_service import PortfolioService
from app.models.user import User
from app.core.database import get_db
from app.core.user_mapping import get_user_db_id
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])

@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current portfolio summary"""
    # Map Supabase UUID to database integer ID
    user_db_id = await get_user_db_id(current_user["id"], db)
    if not user_db_id:
        raise HTTPException(status_code=404, detail="User not found in database")
    
    portfolio_service = PortfolioService(db)
    return await portfolio_service.get_portfolio_summary(str(user_db_id))

@router.get("/analytics", response_model=PortfolioAnalytics)
async def get_portfolio_analytics(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get portfolio analytics including allocation and performance"""
    # Map Supabase UUID to database integer ID
    user_db_id = await get_user_db_id(current_user["id"], db)
    if not user_db_id:
        raise HTTPException(status_code=404, detail="User not found in database")
    
    portfolio_service = PortfolioService(db)
    return await portfolio_service.get_portfolio_analytics(str(user_db_id))

@router.post("/snapshot")
async def take_portfolio_snapshot(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Take a snapshot of current portfolio value"""
    # Map Supabase UUID to database integer ID
    user_db_id = await get_user_db_id(current_user["id"], db)
    if not user_db_id:
        raise HTTPException(status_code=404, detail="User not found in database")
    
    portfolio_service = PortfolioService(db)
    snapshot = await portfolio_service.take_portfolio_snapshot(str(user_db_id))
    return {"message": "Portfolio snapshot created", "snapshot_id": snapshot.id}

@router.get("/history")
async def get_portfolio_history(
    days: int = 30,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get portfolio value history"""
    # Map Supabase UUID to database integer ID
    user_db_id = await get_user_db_id(current_user["id"], db)
    if not user_db_id:
        raise HTTPException(status_code=404, detail="User not found in database")
    
    portfolio_service = PortfolioService(db)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    return await portfolio_service.get_portfolio_snapshots(
        str(user_db_id),
        start_date,
        end_date
    )
