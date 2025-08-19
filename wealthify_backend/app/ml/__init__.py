# Package shim so code expecting `app.ml` can import predictor functions.
# Re-export functions from the top-level ml_model.py
from ... import ml_model as _ml

try:
    predict_expense_sophisticated = _ml.predict_expense_sophisticated
    predict_savings_sophisticated = _ml.predict_savings_sophisticated
    generate_6_month_forecast = _ml.generate_6_month_forecast
    get_realistic_predictions = _ml.get_realistic_predictions
except Exception:
    # If ml_model is not importable at startup (missing deps), leave names undefined
    pass
