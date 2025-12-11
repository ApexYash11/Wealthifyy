from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Optional, Any
from datetime import datetime
import numpy as np
from app.core.database import get_db
from app.core.get_current_user_supabase import get_current_user
from app.core.user_mapping import get_user_db_id
from app.models.user import User
from app.models.expense import Expense
from sqlalchemy.future import select
from ml_model import (
    predict_expense_sophisticated,
    predict_savings_sophisticated,
    generate_6_month_forecast,
    get_realistic_predictions
)

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("/predict-expense")
async def predict_expense(
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        # Map Supabase UUID to database integer ID
        user_db_id = await get_user_db_id(current_user["id"], db)
        if not user_db_id:
            raise HTTPException(status_code=404, detail="User not found in database")
        
        # Extract parameters
        income = data.get("income")
        month = data.get("month", datetime.now().strftime("%b-%Y"))

        # TODO: Update ML functions to work with AsyncSession
        # For now, return a placeholder response
        prediction = {
            "predicted_expense": 2500.0,
            "message": "ML prediction temporarily disabled - using fallback"
        }

        return {
            "predicted_expense": prediction,
            "confidence": 85  # Base confidence, can be adjusted based on data quality
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/savings")
async def predict_savings(
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        # Map Supabase UUID to database integer ID
        user_db_id = await get_user_db_id(current_user["id"], db)
        if not user_db_id:
            raise HTTPException(status_code=404, detail="User not found in database")
        
        # Extract parameters
        income = data.get("income")
        if income is None:
            raise HTTPException(status_code=400, detail="Missing income value")
        try:
            income = float(income)
        except Exception:
            raise HTTPException(status_code=400, detail="Income must be a number")
        month = data.get("month", datetime.now().strftime("%b-%Y"))

        # TODO: Update ML functions to work with AsyncSession
        # For now, return a placeholder response
        prediction = income * 0.15  # Assume 15% savings rate

        return {
            "predicted_savings": prediction,
            "confidence": 85  # Base confidence, can be adjusted based on data quality
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/6-month-forecast")
async def get_forecast(
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        # Map Supabase UUID to database integer ID
        user_db_id = await get_user_db_id(current_user["id"], db)
        if not user_db_id:
            raise HTTPException(status_code=404, detail="User not found in database")
        
        # Extract parameters
        income = data.get("income")
        if income is None:
            raise HTTPException(status_code=400, detail="Missing income value")
        try:
            income = float(income)
        except Exception:
            raise HTTPException(status_code=400, detail="Income must be a number")

        # TODO: Update ML functions to work with AsyncSession
        # For now, return a placeholder response
        forecast_data = {
            "forecast": [
                {"month": f"Month {i+1}", "predicted_expense": income * 0.7, "predicted_savings": income * 0.15, "confidence": 85 - (i * 5)}
                for i in range(6)
            ],
            "message": "ML forecast temporarily disabled - using fallback"
        }

        return forecast_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights/expenses")
async def get_expense_insights(
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        # Map Supabase UUID to database integer ID
        user_db_id = await get_user_db_id(current_user["id"], db)
        if not user_db_id:
            raise HTTPException(status_code=404, detail="User not found in database")
        
        # Get user's expense history - using async query
        result = await db.execute(
            select(Expense)
            .filter(Expense.user_id == user_db_id)
            .order_by(Expense.month.desc())
        )
        expenses = result.scalars().all()

        if not expenses:
            return {
                "message": "No expense data available",
                "insights": []
            }

        def safe_float(val):
            try:
                return float(val)
            except Exception:
                return 0.0

        # Calculate basic insights
        total_expenses = [safe_float(getattr(expense, "total_expense", 0.0)) for expense in expenses]
        avg_expense = np.mean(total_expenses)
        std_expense = np.std(total_expenses)

        insights = [
            {
                "type": "trend",
                "title": "Expense Trend",
                "description": "Your expenses are trending " + ("up" if total_expenses[0] > avg_expense else "down") + " compared to your average"
            },
            {
                "type": "volatility",
                "title": "Expense Stability",
                "description": f"Your expenses vary by about {round(std_expense, 2)} on average"
            }
        ]

        # Add category-specific insights
        for i, expense in enumerate(expenses[:3]):  # Look at recent months
            for category in ['rent', 'groceries', 'transport', 'entertainment']:
                category_value = safe_float(getattr(expense, category, 0.0))
                prev_value = safe_float(getattr(expenses[i+1], category, 0.0)) if i+1 < len(expenses) else 0.0
                if prev_value > 0 and category_value > (prev_value * 1.2):  # 20% increase
                    insights.append({
                        "type": "category_increase",
                        "title": f"High {category.title()} Expenses",
                        "description": f"Your {category} expenses have increased significantly"
                    })

        return {
            "average_monthly_expense": round(avg_expense, 2),
            "expense_volatility": round(std_expense, 2),
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
