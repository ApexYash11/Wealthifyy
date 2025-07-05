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
    month_dt = datetime.strptime(month, "%b-%Y")
    query = text("""
        SELECT total_expense, month 
        FROM expenses 
        WHERE user_id = :user_id 
        AND month < :month 
        ORDER BY month DESC 
        LIMIT 3
    """)
    result = db.execute(query, {"user_id": user_id, "month": month}).fetchall()
    lags = [row[0] for row in result] + [0] * (3 - len(result))
    return lags

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
    """Predict Total_Expense using the expense model."""
    lags = get_lag_features(user_id, month, db)
    # If not enough lag data, return a friendly error
    if len([lag for lag in lags if lag != 0]) < 3:
        return {
            "error": "Not enough data for prediction. Please add at least 3 months of expenses for accurate predictions."
        }
    features = lags + list(get_expense_features(user_id, month, db))
    dmatrix = xgb.DMatrix([features], feature_names=["Lag_1", "Lag_2", "Lag_3"] + [
        "rent", "loan_repayment", "insurance", "groceries", "transport", "eating_out", "entertainment", "utilities", "healthcare", "education", "miscellaneous"
    ])
    prediction = expense_model.predict(dmatrix)[0]
    return prediction

def predict_savings(user_id: int, month: str, income: float, db: Session):
    """Predict Desired_Savings using the budget model."""
    features = list(get_expense_features(user_id, month, db)) + [income]
    dmatrix = xgb.DMatrix([features])
    prediction = budget_model.predict(dmatrix)[0]
    return prediction
