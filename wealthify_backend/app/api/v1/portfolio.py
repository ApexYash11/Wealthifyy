from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.get_current_user_supabase import get_current_user
from app.schemas.portfolio import PortfolioSummary, PortfolioAnalytics
from app.services.portfolio_service import PortfolioService
from app.models.user import User
from app.core.database import get_db
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])

@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current portfolio summary"""
    portfolio_service = PortfolioService(db)
    return portfolio_service.get_portfolio_summary(str(current_user["id"]))

@router.get("/analytics", response_model=PortfolioAnalytics)
async def get_portfolio_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get portfolio analytics including allocation and performance"""
    portfolio_service = PortfolioService(db)
    return portfolio_service.get_portfolio_analytics(str(current_user["id"]))

@router.post("/snapshot")
async def take_portfolio_snapshot(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Take a snapshot of current portfolio value"""
    portfolio_service = PortfolioService(db)
    snapshot = portfolio_service.take_portfolio_snapshot(str(current_user["id"]))
    return {"message": "Portfolio snapshot created", "snapshot_id": snapshot.id}

@router.get("/history")
async def get_portfolio_history(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get portfolio value history"""
    portfolio_service = PortfolioService(db)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    return portfolio_service.get_portfolio_snapshots(
        str(current_user["id"]),
        start_date,
        end_date
    )
