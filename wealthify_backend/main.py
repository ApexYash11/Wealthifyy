from fastapi import FastAPI, Depends, HTTPException, Form, Body, Path
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, List
import os
import json
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from itsdangerous import URLSafeSerializer,URLSafeTimedSerializer
import os 
from pydantic import SecretStr
from sqlalchemy import func
import requests
import yfinance as yf

app = FastAPI()

from model import get_db, User, Expense, Transaction, Feedback, Asset, PortfolioSnapshot
from schema import (
    UserCreate,
    Token,
    LoginResponse,
    ExpenseCreateBulk,
    ExpenseResponse,
    ExpensePredictInput,
    SavingsPredictionInput,
    PredictionResponse,
    TransactionCreate,
    TransactionResponse,
    DashboardData,
    FinancialSummary,
    SpendingCategory,
    AssetCreate,
    AssetResponse,
    PortfolioSnapshotResponse,
    PortfolioOverviewResponse
)
from ml_model import predict_expense, predict_savings, get_realistic_predictions, generate_6_month_forecast
from supabase_auth import supabase_auth, get_current_user_supabase

# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours instead of 30 minutes

# Default values from environment
DEFAULT_SAVINGS_GOAL = float(os.getenv("DEFAULT_SAVINGS_GOAL", "10000.0"))
DEFAULT_SAVINGS_RATE = float(os.getenv("DEFAULT_SAVINGS_RATE", "0.2"))
EMERGENCY_FUND_MONTHS = int(os.getenv("EMERGENCY_FUND_MONTHS", "3"))

# App and security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# email and token config
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD=SecretStr(os.getenv("MAIL_PASSWORD", "")),
    MAIL_FROM=os.getenv("MAIL_FROM", "noreply@example.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", ""),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "Wealthify"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# ✅ Authentication dependency - Using Supabase Auth
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Legacy authentication - kept for backward compatibility"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ✅ Supabase Authentication dependency
def get_current_user_supabase_wrapper(
    current_user: User = Depends(get_current_user_supabase)
):
    """Wrapper for Supabase authentication"""
    return current_user

# ✅ tokens and email verification
def generate_token(email:str):
  s=URLSafeSerializer(SECRET_KEY)
  return s.dumps(email, salt="reset-salt")

# ✅ verify token
def verify_token(token:str):
  s=URLSafeSerializer(SECRET_KEY)
  try:
    email=s.loads(token, salt="reset-salt")
    return email
  except Exception as e:
    raise HTTPException(status_code=401, detail="Invalid token")

# forgot password
@app.post("/forgot-password")
async def forgot_password(email: str = Form(...)):
    try:
        # Check if user exists
        db = next(get_db())
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Use Supabase Auth for password reset if user is using Supabase Auth
        if user.password_hash == "supabase_auth":
            # Use Supabase password reset
            supabase_auth.reset_password(email)
            return {"message": "Password reset email sent successfully via Supabase"}
        else:
            # Legacy email-based password reset
            token = generate_token(email)
            reset_url = f"{os.getenv('FRONTEND_URL')}/reset-password?token={token}"
            message = MessageSchema(
                subject="Reset Your Password",
                recipients=[email],
                body=f"Click the link to reset your password: {reset_url}",
                subtype=MessageType.plain
            )
            fm = FastMail(conf)
            await fm.send_message(message)
            return {"message": "Reset email sent."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send reset email: {str(e)}")

# ✅ reset password
@app.post("/reset-password")
def reset_password(
    token: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        email = verify_token(token)
        hashed_pw = pwd_context.hash(new_password)
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        setattr(user, "password_hash", hashed_pw)
        db.commit()
        return {"message": "Password updated successfully."}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")

# ✅ User Registration with Supabase Auth
@app.post("/register", response_model=LoginResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user already exists in our database
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Check if username already exists
        if user.username:
            existing_username = db.query(User).filter(User.username == user.username).first()
            if existing_username:
                raise HTTPException(status_code=400, detail="Username already taken")
        
        # Create user in Supabase Auth
        supabase_response = supabase_auth.sign_up(
            email=user.email,
            password=user.password,
            user_data={
                "username": user.username or user.email.split("@")[0],
                "name": user.username or user.email.split("@")[0]
            }
        )
        
        # Create user in our database
        supabase_user = supabase_response["user"]
        db_user = User(
            supabase_id=supabase_user["id"],
            email=user.email,
            username=user.username or user.email.split("@")[0],
            password_hash="supabase_auth",  # Placeholder for Supabase Auth users
            savings_goal=DEFAULT_SAVINGS_GOAL,
            current_savings=0.0
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Return Supabase session data
        session = supabase_response["session"]
        return {
            "token": session["access_token"],
            "user": {
                "id": str(db_user.id),
                "email": db_user.email,
                "name": db_user.username,
                "created_at": db_user.created_at.isoformat() if db_user.created_at is not None else None,
                "supabase_id": db_user.supabase_id
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@app.post("/login", response_model=LoginResponse)
async def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        username_clean = username.strip()
        print(f"🔍 Login attempt - Username: '{username}' (cleaned: '{username_clean}'), Password length: {len(password)}")
        
        # Try to find user by username or email
        db_user = db.query(User).filter(User.username == username_clean).first()
        if not db_user:
            # Try by email
            db_user = db.query(User).filter(User.email == username_clean).first()
        
        if not db_user:
            print(f"❌ No user found with username/email: '{username_clean}'")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print(f"✅ User found: ID={db_user.id}, Username='{db_user.username}', Email='{db_user.email}'")
        
        # Check if user is using Supabase Auth
        if db_user.password_hash == "supabase_auth":
            # Use Supabase Auth for authentication
            try:
                supabase_response = supabase_auth.sign_in(
                    email=db_user.email,
                    password=password
                )
                
                session = supabase_response["session"]
                return {
                    "token": session["access_token"],
                    "user": {
                        "id": str(db_user.id),
                        "email": db_user.email,
                        "name": db_user.username,
                        "created_at": db_user.created_at.isoformat() if db_user.created_at is not None else None,
                        "supabase_id": db_user.supabase_id
                    }
                }
            except Exception as e:
                print(f"❌ Supabase Auth failed: {str(e)}")
                raise HTTPException(status_code=401, detail="Invalid credentials")
        else:
            # Legacy authentication for existing users
            if not pwd_context.verify(password, db_user.password_hash):
                print(f"❌ Password verification failed")
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            print(f"✅ Password verified successfully")
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = jwt.encode(
                {"sub": str(db_user.id), "exp": datetime.utcnow() + access_token_expires},
                SECRET_KEY,
                algorithm=ALGORITHM
            )
            return {
                "token": access_token,
                "user": {
                    "id": str(db_user.id),
                    "email": db_user.email,
                    "name": db_user.username,
                    "created_at": db_user.created_at.isoformat() if db_user.created_at is not None else None
                }
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

# ✅ Add multiple expenses
@app.post("/expenses")
async def create_expenses(
    bulk_expenses: ExpenseCreateBulk,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    for expense in bulk_expenses.expenses:
        db_user = db.query(User).filter(User.id == expense.user_id).first()
        if not db_user:
            raise HTTPException(status_code=400, detail=f"User ID {expense.user_id} does not exist")
        db_expense = Expense(**expense.dict())
        db.add(db_expense)
    db.commit()
    return {"message": "Expenses added successfully"}

# ✅ Fetch specific user's expenses
@app.get("/expenses/{user_id}", response_model=List[ExpenseResponse])
async def get_expenses(
    user_id: int,
    month: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Expense).filter(Expense.user_id == user_id)
    if month:
        query = query.filter(Expense.month == month)
    expenses = query.all()
    if not expenses:
        raise HTTPException(status_code=404, detail="No expenses found")
    return expenses

# ✅ Fetch all expenses
@app.get("/expenses", response_model=List[ExpenseResponse])
async def get_all_expenses(
    month: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Expense)
    if month:
        query = query.filter(Expense.month == month)
    return query.all()

# ✅ Expense prediction endpoint
@app.post("/predict-expense", response_model=PredictionResponse)
async def predict_expense_endpoint(
    input: ExpensePredictInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Try ML model first
    prediction = predict_expense(input.user_id, input.month, db)
    
    # If ML model fails or returns error, use realistic predictions
    if isinstance(prediction, dict) and "error" in prediction:
        # Use realistic predictions as fallback
        realistic_expenses, _ = get_realistic_predictions(input.income)
        prediction = realistic_expenses
    
    return PredictionResponse(prediction=prediction, month=input.month)

# ✅ Savings prediction endpoint
@app.post("/predict/savings", response_model=PredictionResponse)
async def predict_savings_endpoint(
    input: SavingsPredictionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Try ML model first
    prediction = predict_savings(input.user_id, input.month, input.income, db)
    
    # If ML model fails or returns error, use realistic predictions
    if isinstance(prediction, dict) and "error" in prediction:
        # Use realistic predictions as fallback
        _, realistic_savings = get_realistic_predictions(input.income)
        prediction = realistic_savings
    
    return PredictionResponse(prediction=prediction, month=input.month)

# ✅ 6-Month Financial Forecast endpoint
@app.post("/predict/6-month-forecast")
async def predict_6_month_forecast(
    user_id: int = Body(..., embed=True),
    income: float = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate sophisticated 6-month financial forecast."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's data")
    
    forecast_result = generate_6_month_forecast(user_id, income, db)
    return forecast_result

# ✅ Add transaction
@app.post("/transactions", response_model=TransactionResponse)
async def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify user exists
    db_user = db.query(User).filter(User.id == transaction.user_id).first()
    if not db_user:
        raise HTTPException(status_code=400, detail=f"User ID {transaction.user_id} does not exist")
    
    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

# ✅ Get user transactions
@app.get("/transactions/{user_id}", response_model=List[TransactionResponse])
async def get_transactions(
    user_id: int,
    limit: Optional[int] = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transaction).filter(Transaction.user_id == user_id).order_by(Transaction.created_at.desc())
    if limit:
        query = query.limit(limit)
    transactions = query.all()
    return transactions

# ✅ Update user savings goal
@app.put("/users/{user_id}/savings-goal")
async def update_savings_goal(
    user_id: int,
    savings_goal: float = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's savings goal."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user's savings goal")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if savings_goal < 0:
        raise HTTPException(status_code=400, detail="Savings goal cannot be negative")
    
    user.savings_goal = savings_goal
    db.commit()
    db.refresh(user)
    
    return {"message": "Savings goal updated successfully", "savings_goal": user.savings_goal}

# ✅ Get user savings goal
@app.get("/users/{user_id}/savings-goal")
async def get_savings_goal(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's current savings goal."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's savings goal")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"savings_goal": user.savings_goal or 0.0}

# ✅ Calculate smart savings goal based on income
@app.post("/users/{user_id}/calculate-savings-goal")
async def calculate_savings_goal(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate a smart savings goal based on user's income and expenses."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to calculate savings goal for this user")
    
    # Get user's monthly income
    current_month = datetime.now().strftime("%Y-%m")
    monthly_income = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income",
        Transaction.date.like(f"{current_month}%")
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0.0
    
    # Get user's monthly expenses
    monthly_expenses = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date.like(f"{current_month}%")
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0.0
    
    # Calculate recommended savings goal using environment variables
    recommended_savings = max(
        monthly_income * DEFAULT_SAVINGS_RATE,  # Use configurable savings rate
        monthly_expenses * EMERGENCY_FUND_MONTHS   # Use configurable emergency fund months
    )
    
    return {
        "recommended_savings_goal": round(recommended_savings, 2),
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "calculation_basis": f"{DEFAULT_SAVINGS_RATE * 100}% of income or {EMERGENCY_FUND_MONTHS} months of expenses, whichever is higher"
    }

# ✅ Get dashboard data
@app.get("/dashboard/{user_id}", response_model=DashboardData)
async def get_dashboard_data(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get recent transactions
    recent_transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).order_by(Transaction.created_at.desc()).limit(5).all()
    
    # Calculate financial summary
    current_month = datetime.now().strftime("%Y-%m")
    # Calculate last month string
    last_month_date = datetime.now().replace(day=1) - timedelta(days=1)
    last_month = last_month_date.strftime("%Y-%m")
    
    # Get monthly income (transactions with type "income" in current month)
    monthly_income = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income",
        Transaction.date.like(f"{current_month}%")
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0.0
    
    # Get monthly expenses (transactions with type "expense" in current month)
    monthly_expenses = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date.like(f"{current_month}%")
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0.0
    
    # Calculate total balance as monthly income minus monthly expenses
    total_balance = monthly_income - monthly_expenses

    # Calculate all-time totals for savings calculation
    total_income = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income"
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0.0
    
    total_expenses = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense"
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0.0
    
    # Calculate all-time balance for savings
    all_time_balance = total_income - total_expenses

    # Calculate last month's income and expenses for comparison
    last_month_income = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income",
        Transaction.date.like(f"{last_month}%")
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0.0
    last_month_expenses = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date.like(f"{last_month}%")
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0.0
    last_month_balance = last_month_income - last_month_expenses

    # Fetch user from database
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Use user's savings_goal from DB, or calculate a smart default
    savings_goal = user.savings_goal
    if savings_goal is None or savings_goal == 0:
        # Calculate smart default using environment variables
        smart_savings = max(
            monthly_income * DEFAULT_SAVINGS_RATE,  # Use configurable savings rate
            monthly_expenses * EMERGENCY_FUND_MONTHS   # Use configurable emergency fund months
        )
        savings_goal = smart_savings

    # Use user-editable current_savings
    current_savings = user.current_savings if user.current_savings is not None else 0.0
    
    # Calculate spending categories
    category_expenses = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total_amount')
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date.like(f"{current_month}%")
    ).group_by(Transaction.category).all()
    
    total_category_expenses = sum(cat.total_amount for cat in category_expenses)
    
    spending_categories = []
    for cat in category_expenses:
        percentage = (cat.total_amount / total_category_expenses * 100) if total_category_expenses > 0 else 0
        spending_categories.append(SpendingCategory(
            category=cat.category,
            amount=cat.total_amount,
            percentage=round(percentage, 1)
        ))
    
    summary = FinancialSummary(
        total_balance=total_balance,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        savings_goal=savings_goal,
        current_savings=current_savings,
        last_month_balance=last_month_balance,
        last_month_income=last_month_income,
        last_month_expenses=last_month_expenses
    )
    
    return DashboardData(
        summary=summary,
        recent_transactions=[TransactionResponse(**transaction.__dict__) for transaction in recent_transactions],
        spending_categories=spending_categories
    )

@app.post("/feedback")
async def submit_feedback(
    message: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"🔍 DEBUG: Feedback endpoint called")
    print(f"🔍 DEBUG: User ID: {current_user.id}")
    print(f"🔍 DEBUG: Message: {message}")
    
    try:
        feedback = Feedback(user_id=current_user.id, message=message)
        db.add(feedback)
        db.commit()
        print(f"✅ DEBUG: Feedback saved successfully with ID: {feedback.id}")
        return {"message": "Feedback submitted"}
    except Exception as e:
        print(f"❌ DEBUG: Error saving feedback: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save feedback: {str(e)}")

@app.get("/feedback")
async def get_feedback(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    feedbacks = db.query(Feedback).all()
    return [
        {"user_id": str(f.user_id), "message": f.message, "created_at": f.created_at}
        for f in feedbacks
    ]

# Add asset
@app.post("/assets", response_model=AssetResponse)
def add_asset(
    asset: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_asset = Asset(**asset.dict(), user_id=current_user.id)
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

# List assets
@app.get("/assets", response_model=List[AssetResponse])
def list_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Asset).filter(Asset.user_id == current_user.id).all()

def fetch_yahoo_price(symbol: str, asset_type: str) -> float:
    if asset_type == "crypto":
        symbol = f"{symbol}-INR"
    elif asset_type == "stock":
        # Assume Indian stocks unless symbol is all uppercase (US stock)
        if symbol.isupper():
            pass  # US stock, use as is
        else:
            symbol = f"{symbol}.NS"
    else:
        return 0.0  # For mutual funds/cash, no live price
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period='1d')
        if not hist.empty:
            return float(hist['Close'].iloc[-1])
    except Exception:
        pass
    return 0.0

# Portfolio overview (total value, gain/loss)
@app.get("/portfolio/overview", response_model=PortfolioOverviewResponse)
def portfolio_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assets = db.query(Asset).filter(Asset.user_id == current_user.id).all()
    total_value = 0.0
    invested_total = 0.0
    asset_responses = []
    for asset in assets:
        buy_price = float(getattr(asset, 'buy_price', 0.0))
        quantity = float(getattr(asset, 'quantity', 0.0))
        asset_id = getattr(asset, 'id', 0) or 0
        buy_date = getattr(asset, 'buy_date', None)
        asset_type = getattr(asset, 'type', 'crypto')
        if not isinstance(buy_date, datetime):
            buy_date = datetime.utcnow()
        # Fetch live price or fallback
        if asset_type in ["crypto", "stock"]:
            current_price = fetch_yahoo_price(str(getattr(asset, 'symbol', '')), asset_type)
            if current_price == 0.0:
                current_price = buy_price
        else:
            current_price = buy_price
        value = current_price * quantity
        total_value += value
        invested_total += buy_price * quantity
        asset_responses.append(AssetResponse(
            id=asset_id,
            name=getattr(asset, 'name', ''),
            symbol=getattr(asset, 'symbol', ''),
            quantity=quantity,
            buy_price=buy_price,
            buy_date=buy_date,
            type=asset_type
        ))
    gain_loss = total_value - invested_total
    percent_change = (gain_loss / invested_total * 100) if invested_total and invested_total > 0 else 0
    return PortfolioOverviewResponse(
        total_value=float(total_value),
        invested_total=float(invested_total),
        gain_loss=float(gain_loss),
        percent_change=float(percent_change),
        assets=asset_responses
    )

# Save daily snapshot (call from CRON or login)
@app.post("/portfolio/snapshot")
def save_snapshot(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assets = db.query(Asset).filter(Asset.user_id == current_user.id).all()
    total_value = sum(
        fetch_yahoo_price(str(getattr(asset, 'symbol', '')), getattr(asset, 'type', 'crypto')) * float(getattr(asset, 'quantity', 0.0))
        if getattr(asset, 'type', 'crypto') in ["crypto", "stock"] else float(getattr(asset, 'buy_price', 0.0)) * float(getattr(asset, 'quantity', 0.0))
        for asset in assets
    )
    snapshot = PortfolioSnapshot(user_id=current_user.id, value=total_value)
    db.add(snapshot)
    db.commit()
    return {"message": "Snapshot saved", "value": total_value}

# Get performance history
@app.get("/portfolio/history", response_model=List[PortfolioSnapshotResponse])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(PortfolioSnapshot).filter(PortfolioSnapshot.user_id == current_user.id).order_by(PortfolioSnapshot.timestamp).all()

@app.put("/assets/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int = Path(...),
    asset: AssetCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_asset = db.query(Asset).filter(Asset.id == asset_id, Asset.user_id == current_user.id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    for key, value in asset.dict().items():
        setattr(db_asset, key, value)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@app.delete("/assets/{asset_id}")
def delete_asset(
    asset_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_asset = db.query(Asset).filter(Asset.id == asset_id, Asset.user_id == current_user.id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    db.delete(db_asset)
    db.commit()
    return {"message": "Asset deleted"}

@app.put("/users/{user_id}/current-savings")
async def update_current_savings(
    user_id: int,
    current_savings: float = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.current_savings = current_savings
    db.commit()
    db.refresh(user)
    return {"message": "Current savings updated", "current_savings": user.current_savings}

# ✅ Supabase Auth specific endpoints

@app.post("/auth/supabase/verify")
async def verify_supabase_token(
    token: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Verify Supabase JWT token and return user data"""
    try:
        user = supabase_auth.get_user_from_token(token, db)
        return {
            "valid": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "supabase_id": user.supabase_id,
                "savings_goal": user.savings_goal,
                "current_savings": user.current_savings
            }
        }
    except Exception as e:
        return {"valid": False, "error": str(e)}

@app.post("/auth/supabase/signout")
async def supabase_signout(
    current_user: User = Depends(get_current_user_supabase)
):
    """Sign out user from Supabase"""
    try:
        supabase_auth.sign_out("")  # Token is handled by Supabase client
        return {"message": "Successfully signed out"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sign out failed: {str(e)}")

@app.post("/auth/supabase/refresh")
async def refresh_supabase_token(
    refresh_token: str = Body(..., embed=True)
):
    """Refresh Supabase access token"""
    try:
        # This would typically use Supabase's refresh token endpoint
        # For now, we'll return a message indicating the frontend should handle this
        return {"message": "Token refresh should be handled by Supabase client"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}")

# ✅ Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "supabase_connected": bool(supabase_auth.supabase)
    }

# ✅ Local dev server (optional)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
else:
    from scheduler import start_scheduler
    start_scheduler()
