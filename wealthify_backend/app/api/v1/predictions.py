from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Any
from datetime import datetime
import numpy as np
from app.core.database import get_db
from app.core.get_current_user_supabase import get_current_user
from app.models.user import User
from app.models.expense import Expense
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Extract parameters
        income = data.get("income")
        month = data.get("month", datetime.now().strftime("%b-%Y"))

        # Generate prediction
        prediction = predict_expense_sophisticated(current_user["id"], month, db)

        if isinstance(prediction, dict) and "error" in prediction:
            raise HTTPException(status_code=400, detail=prediction["error"])

        return {
            "predicted_expense": prediction,
            "confidence": 85  # Base confidence, can be adjusted based on data quality
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/savings")
async def predict_savings(
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Extract parameters

        income = data.get("income")
        if income is None:
            raise HTTPException(status_code=400, detail="Missing income value")
        try:
            income = float(income)
        except Exception:
            raise HTTPException(status_code=400, detail="Income must be a number")
        month = data.get("month", datetime.now().strftime("%b-%Y"))

        # Generate prediction
        prediction = predict_savings_sophisticated(current_user["id"], month, income, db)

        if isinstance(prediction, dict) and "error" in prediction:
            raise HTTPException(status_code=400, detail=prediction["error"])

        return {
            "predicted_savings": prediction,
            "confidence": 85  # Base confidence, can be adjusted based on data quality
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/6-month-forecast")
async def get_forecast(
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Extract parameters

        income = data.get("income")
        if income is None:
            raise HTTPException(status_code=400, detail="Missing income value")
        try:
            income = float(income)
        except Exception:
            raise HTTPException(status_code=400, detail="Income must be a number")

        # Generate forecast
        forecast_data = generate_6_month_forecast(current_user["id"], income, db)

        if isinstance(forecast_data, dict) and "error" in forecast_data:
            return forecast_data

        # Add confidence scores to each forecast entry
        for idx, entry in enumerate(forecast_data["forecast"]):
            entry["confidence"] = 85 - (idx * 5)  # Confidence decreases for future months

        return forecast_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights/expenses")
async def get_expense_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Get user's expense history
        expenses = db.query(Expense).filter(Expense.user_id == current_user["id"]).order_by(Expense.month.desc()).all()

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
