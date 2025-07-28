import xgboost as xgb
import pickle
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from datetime import datetime

# Load the pre-trained XGBoost expense model (JSON)
expense_model = xgb.Booster()
expense_model.load_model("expense_model.json")

# Load the pre-trained savings model (Pickle)
with open("budget_model.pkl", "rb") as f:
    budget_model = pickle.load(f)

def get_lag_features(user_id: int, month: str, db: Session):
    """Fetch the last 3 months' total_expense for lag features."""
    try:
        month_dt = datetime.strptime(month, "%b-%Y")
        # Convert to string format for database comparison
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
        # If month format is invalid, return zeros
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
    """Predict Total_Expense using the expense model with improved scaling."""
    try:
        lags = get_lag_features(user_id, month, db)
        # If not enough lag data, return a friendly error
        if len([lag for lag in lags if lag != 0]) < 2:
            return {
                "error": "Not enough data for prediction. Please add at least 2 months of expenses for accurate predictions."
            }
        
        # Only use the 3 lag features that the model was trained with
        features = lags
        dmatrix = xgb.DMatrix([features], feature_names=["Lag_1", "Lag_2", "Lag_3"])
        prediction = expense_model.predict(dmatrix)[0]
        
        # Ensure prediction is not negative and scale appropriately
        base_prediction = max(0, prediction)
        
        # If the prediction seems too low (less than 1000), scale it up
        # This is because the training data was on smaller amounts
        if base_prediction < 1000:
            base_prediction = base_prediction * 3  # Scale up for more realistic amounts
        
        return base_prediction
    except Exception as e:
        return {
            "error": f"Error making prediction: {str(e)}"
        }

def predict_savings(user_id: int, month: str, income: float, db: Session):
    """Predict Desired_Savings using the budget model with improved scaling."""
    try:
        # Get expense features and combine with income
        expense_features = list(get_expense_features(user_id, month, db))
        features = expense_features + [income]
        
        # Try to use the model directly without DMatrix to avoid feature_types issue
        try:
            # First try with DMatrix
            feature_names = [
                "rent", "loan_repayment", "insurance", "groceries", "transport", "eating_out", 
                "entertainment", "utilities", "healthcare", "education", "miscellaneous", "income"
            ]
            dmatrix = xgb.DMatrix([features], feature_names=feature_names)
            prediction = budget_model.predict(dmatrix)[0]
        except AttributeError:
            # If that fails, try using the model directly with numpy array
            import numpy as np
            features_array = np.array([features])
            prediction = budget_model.predict(features_array)[0]
        
        # Ensure prediction is not negative and scale appropriately
        base_prediction = max(0, prediction)
        
        # If the prediction seems too low, scale it up
        if base_prediction < 1000:
            base_prediction = base_prediction * 2.5  # Scale up for more realistic amounts
        
        # Ensure savings don't exceed income
        return min(base_prediction, income * 0.8)  # Max 80% of income as savings
    except Exception as e:
        return {
            "error": f"Error making prediction: {str(e)}"
        }

def get_realistic_predictions(income: float):
    """Generate realistic predictions based on income level for Indian context."""
    # For Indian context, typical expense ratios
    if income <= 15000:
        # Low income: higher expense ratio
        expense_ratio = 0.85  # 85% on expenses
        savings_ratio = 0.15  # 15% savings
    elif income <= 30000:
        # Medium income: balanced ratio
        expense_ratio = 0.75  # 75% on expenses
        savings_ratio = 0.25  # 25% savings
    elif income <= 50000:
        # Higher income: lower expense ratio
        expense_ratio = 0.65  # 65% on expenses
        savings_ratio = 0.35  # 35% savings
    else:
        # High income: even lower expense ratio
        expense_ratio = 0.55  # 55% on expenses
        savings_ratio = 0.45  # 45% savings
    
    predicted_expenses = income * expense_ratio
    predicted_savings = income * savings_ratio
    
    return predicted_expenses, predicted_savings
