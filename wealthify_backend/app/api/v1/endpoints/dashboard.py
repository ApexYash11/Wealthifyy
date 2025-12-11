from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract, desc
from datetime import datetime, timedelta
from typing import Dict, Any, List

from app.core.database import get_db
from app.core.get_current_user_supabase import get_current_user
from app.core.user_mapping import get_user_db_id
from app.models.transaction import Transaction
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

class SavingsGoalUpdate(BaseModel):
    savings_goal: float

@router.put("/savings-goal")
async def update_savings_goal(
    goal_data: SavingsGoalUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = await get_user_db_id(current_user["id"], db)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_result = await db.execute(select(User).filter(User.id == user_id))
    user = user_result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.savings_goal = goal_data.savings_goal
    await db.commit()
    
    return {"message": "Savings goal updated", "savings_goal": user.savings_goal}

@router.get("/")
async def get_dashboard_data(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify the requested user_id matches the authenticated user
    # First get the DB ID of the authenticated user
    user_id = await get_user_db_id(current_user["id"], db)
    
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found in database")

    # Get user details (savings goal, etc)
    user_result = await db.execute(select(User).filter(User.id == user_id))
    user = user_result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Date calculations
    now = datetime.now()
    current_month = now.month
    current_year = now.year
    
    last_month_date = now.replace(day=1) - timedelta(days=1)
    last_month = last_month_date.month
    last_month_year = last_month_date.year

    # Helper to get sums
    async def get_sum(month, year, type_):
        query = select(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year,
            Transaction.type == type_
        )
        result = await db.execute(query)
        return result.scalar() or 0.0

    # Current Month Stats
    monthly_income = await get_sum(current_month, current_year, 'income')
    monthly_expenses = await get_sum(current_month, current_year, 'expense')
    
    # Last Month Stats
    last_month_income = await get_sum(last_month, last_month_year, 'income')
    last_month_expenses = await get_sum(last_month, last_month_year, 'expense')
    last_month_balance = last_month_income - last_month_expenses # Simplified

    # Total Balance (All time income - All time expenses)
    # Or use user.current_savings if that's preferred. 
    # Let's calculate from transactions for accuracy + user.current_savings as base if needed.
    # For now, let's assume total_balance = all_income - all_expenses
    all_income_query = select(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id, Transaction.type == 'income'
    )
    all_expenses_query = select(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id, Transaction.type == 'expense'
    )
    
    all_income = (await db.execute(all_income_query)).scalar() or 0.0
    all_expenses = (await db.execute(all_expenses_query)).scalar() or 0.0
    total_balance = all_income - all_expenses

    # Recent Transactions
    recent_tx_query = select(Transaction).filter(
        Transaction.user_id == user_id
    ).order_by(desc(Transaction.date)).limit(5)
    recent_tx_result = await db.execute(recent_tx_query)
    recent_transactions = recent_tx_result.scalars().all()

    # Spending Categories (Current Month)
    categories_query = select(
        Transaction.category,
        func.sum(Transaction.amount).label('amount')
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'expense',
        extract('month', Transaction.date) == current_month,
        extract('year', Transaction.date) == current_year
    ).group_by(Transaction.category)
    
    categories_result = await db.execute(categories_query)
    spending_categories = []
    
    for cat, amount in categories_result.all():
        percentage = (amount / monthly_expenses * 100) if monthly_expenses > 0 else 0
        spending_categories.append({
            "category": cat,
            "amount": amount,
            "percentage": round(percentage, 1)
        })

    return {
        "summary": {
            "total_balance": total_balance,
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "savings_goal": user.savings_goal,
            "current_savings": user.current_savings, # Or use total_balance?
            "last_month_balance": last_month_balance,
            "last_month_income": last_month_income,
            "last_month_expenses": last_month_expenses
        },
        "recent_transactions": recent_transactions,
        "spending_categories": spending_categories
    }
