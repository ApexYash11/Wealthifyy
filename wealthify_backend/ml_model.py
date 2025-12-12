import xgboost as xgb
import random
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from datetime import datetime, timedelta
import math
import logging
import os

# Configure logging
logger = logging.getLogger(__name__)

# Get the directory where this file (ml_model.py) is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define absolute paths to models
EXPENSE_MODEL_PATH = os.path.join(BASE_DIR, "expense_model.json")
BUDGET_MODEL_PATH = os.path.join(BASE_DIR, "budget_model.json")

# Load the pre-trained XGBoost expense model (JSON format - stable for Docker/Railway)
try:
    expense_model = xgb.Booster()
    expense_model.load_model(EXPENSE_MODEL_PATH)
    logger.info(f"Successfully loaded expense_model.json from {EXPENSE_MODEL_PATH}")
except Exception as e:
    logger.error(f"Failed to load expense_model.json from {EXPENSE_MODEL_PATH}: {str(e)}")
    raise RuntimeError(f"Critical: Could not load ML models. Error: {str(e)}")

# Load the pre-trained budget model (JSON format - stable for Docker/Railway)
try:
    budget_model = xgb.Booster()
    budget_model.load_model(BUDGET_MODEL_PATH)
    logger.info(f"Successfully loaded budget_model.json from {BUDGET_MODEL_PATH}")
except Exception as e:
    logger.error(f"Failed to load budget_model.json from {BUDGET_MODEL_PATH}: {str(e)}")
    raise RuntimeError(f"Critical: Could not load ML models. Error: {str(e)}")

def get_user_expense_history(user_id: int, db: Session):
    """Get user's expense history for analysis."""
    query = text("""
        SELECT month, total_expense, rent, loan_repayment, insurance, groceries, 
               transport, eating_out, entertainment, utilities, healthcare, education, miscellaneous
        FROM expenses 
        WHERE user_id = :user_id 
        ORDER BY month DESC
    """)
    result = db.execute(query, {"user_id": user_id}).fetchall()
    return result

def has_sufficient_data(user_id: int, db: Session, min_months: int = 3):
    """Check if user has sufficient data for predictions."""
    history = get_user_expense_history(user_id, db)
    return len(history) >= min_months

def calculate_seasonal_factors(month_str: str):
    """Calculate seasonal factors for different months."""
    try:
        month_dt = datetime.strptime(month_str, "%b-%Y")
        month_num = month_dt.month
        
        # Seasonal factors based on Indian context
        seasonal_factors = {
            1: 1.15,   # January - New Year, higher spending
            2: 1.05,   # February - Valentine's, moderate
            3: 0.95,   # March - End of financial year, lower
            4: 1.10,   # April - New financial year, moderate
            5: 0.90,   # May - Summer, lower spending
            6: 0.85,   # June - Monsoon, lower spending
            7: 0.95,   # July - Moderate
            8: 1.00,   # August - Independence Day, normal
            9: 1.05,   # September - Festivals start, moderate
            10: 1.20,  # October - Festival season, high spending
            11: 1.25,  # November - Diwali, highest spending
            12: 1.30   # December - Christmas, New Year, highest
        }
        return seasonal_factors.get(month_num, 1.0)
    except:
        return 1.0

def calculate_trend_factor(user_id: int, db: Session):
    """Calculate trend factor based on user's spending pattern."""
    history = get_user_expense_history(user_id, db)
    if len(history) < 2:
        return 1.0
    
    # Calculate trend from last 3 months
    recent_expenses = [row[1] for row in history[:3]]
    if len(recent_expenses) >= 2:
        trend = (recent_expenses[0] - recent_expenses[-1]) / recent_expenses[-1]
        # Limit trend factor between 0.8 and 1.2
        trend_factor = 1 + (trend * 0.1)
        return max(0.8, min(1.2, trend_factor))
    return 1.0

def add_realistic_variation(base_value: float, variation_percent: float = 15):
    """Add realistic random variation to predictions."""
    variation = random.uniform(-variation_percent, variation_percent) / 100
    return base_value * (1 + variation)

def predict_expense_sophisticated(user_id: int, month: str, db: Session):
    """Sophisticated expense prediction with multiple factors."""
    try:
        # Check if user has sufficient data
        if not has_sufficient_data(user_id, db, 3):
            return {
                "error": "Insufficient data for accurate predictions. Please add at least 3 months of expense data."
            }
        
        history = get_user_expense_history(user_id, db)
        if not history:
            return {"error": "No expense history found."}
        
        # Calculate base prediction from ML model
        lags = [row[1] for row in history[:3]] + [0] * (3 - len(history[:3]))
        features = lags
        dmatrix = xgb.DMatrix([features], feature_names=["Lag_1", "Lag_2", "Lag_3"])
        ml_prediction = expense_model.predict(dmatrix)[0]
        
        # Apply sophisticated adjustments
        seasonal_factor = calculate_seasonal_factors(month)
        trend_factor = calculate_trend_factor(user_id, db)
        
        # Calculate average from history
        avg_expense = sum(row[1] for row in history[:6]) / min(len(history[:6]), 6)
        
        # Combine ML prediction with historical average
        base_prediction = (ml_prediction * 0.6 + avg_expense * 0.4)
        
        # Apply factors
        adjusted_prediction = base_prediction * seasonal_factor * trend_factor
        
        # Add realistic variation
        final_prediction = add_realistic_variation(adjusted_prediction, 12)
        
        # Ensure reasonable bounds
        final_prediction = max(5000, min(final_prediction, 100000))
        
        return round(final_prediction, 2)
        
    except Exception as e:
        return {"error": f"Error in sophisticated prediction: {str(e)}"}

def predict_savings_sophisticated(user_id: int, month: str, income: float, db: Session):
    """Sophisticated savings prediction with multiple factors."""
    try:
        if not has_sufficient_data(user_id, db, 3):
            return {
                "error": "Insufficient data for accurate predictions. Please add at least 3 months of expense data."
            }
        
        # Get expense prediction
        expense_prediction = predict_expense_sophisticated(user_id, month, db)
        if isinstance(expense_prediction, dict) and "error" in expense_prediction:
            return expense_prediction
        
        # Calculate base savings
        base_savings = income - expense_prediction
        
        # Apply seasonal factors (inverse of expense seasonality)
        seasonal_factor = 1 / calculate_seasonal_factors(month)
        
        # Add variation
        final_savings = add_realistic_variation(base_savings * seasonal_factor, 10)
        
        # Ensure reasonable bounds
        final_savings = max(0, min(final_savings, income * 0.6))
        
        return round(final_savings, 2)
        
    except Exception as e:
        return {"error": f"Error in savings prediction: {str(e)}"}

def generate_6_month_forecast(user_id: int, income: float, db: Session):
    """Generate sophisticated 6-month forecast with different values for each month."""
    if not has_sufficient_data(user_id, db, 3):
        return {
            "error": "Insufficient data for 6-month forecast. Please add at least 3 months of expense data.",
            "can_show_forecast": False
        }
    
    forecast = []
    current_date = datetime.now()
    
    for i in range(6):
        # Calculate future month
        future_date = current_date + timedelta(days=30*i)
        month_str = future_date.strftime("%b-%Y")
        
        # Generate predictions for this month
        expense_pred = predict_expense_sophisticated(user_id, month_str, db)
        savings_pred = predict_savings_sophisticated(user_id, month_str, income, db)
        
        if isinstance(expense_pred, dict) or isinstance(savings_pred, dict):
            return {
                "error": "Error generating forecast",
                "can_show_forecast": False
            }
        
        forecast.append({
            "month": month_str,
            "expenses": expense_pred,
            "savings": savings_pred,
            "net_income": round(income - expense_pred, 2)
        })
    
    return {
        "forecast": forecast,
        "can_show_forecast": True
    }

# Legacy functions for backward compatibility
def get_lag_features(user_id: int, month: str, db: Session):
    """Fetch the last 3 months' total_expense for lag features."""
    try:
        month_dt = datetime.strptime(month, "%b-%Y")
        month_str = month_dt.strftime("%b-%Y")
        
        query = text("""
            SELECT total_expense, month 
            FROM expenses 
            WHERE user_id = :user_id 
            AND month < :month 
            ORDER BY month DESC 
            LIMIT 3
        """)
        result = db.execute(query, {"user_id": user_id, "month": month_str}).fetchall()
        lags = [row[0] for row in result] + [0] * (3 - len(result))
        return lags
    except ValueError:
        return [0, 0, 0]

def get_expense_features(user_id: int, month: str, db: Session):
    query = text("""
        SELECT rent, loan_repayment, insurance, groceries, transport, eating_out, 
               entertainment, utilities, healthcare, education, miscellaneous 
        FROM expenses 
        WHERE user_id = :user_id 
        AND month = :month
    """)
    result = db.execute(query, {"user_id": user_id, "month": month}).fetchone()
    if result:
        return result
    return (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)

def predict_expense(user_id: int, month: str, db: Session):
    """Legacy expense prediction - now uses sophisticated version."""
    return predict_expense_sophisticated(user_id, month, db)

def predict_savings(user_id: int, month: str, income: float, db: Session):
    """Legacy savings prediction - now uses sophisticated version."""
    return predict_savings_sophisticated(user_id, month, income, db)

def get_realistic_predictions(income: float):
    """Generate realistic predictions based on income level for Indian context."""
    # For Indian context, typical expense ratios with variation
    if income <= 15000:
        expense_ratio = random.uniform(0.80, 0.90)
        savings_ratio = 1 - expense_ratio
    elif income <= 30000:
        expense_ratio = random.uniform(0.70, 0.80)
        savings_ratio = 1 - expense_ratio
    elif income <= 50000:
        expense_ratio = random.uniform(0.60, 0.70)
        savings_ratio = 1 - expense_ratio
    else:
        expense_ratio = random.uniform(0.50, 0.60)
        savings_ratio = 1 - expense_ratio
    
    predicted_expenses = income * expense_ratio
    predicted_savings = income * savings_ratio
    
    return predicted_expenses, predicted_savings
