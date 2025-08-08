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

from model import get_db, User, Expense, Transaction, Feedback, Asset, PortfolioSnapshot, DATABASE_AVAILABLE
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
from token_manager import token_manager

# Import new auth routes
from auth_routes import auth_router, get_current_user_any

# Import configuration
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, DEFAULT_SAVINGS_GOAL, DEFAULT_SAVINGS_RATE, EMERGENCY_FUND_MONTHS

# App and security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

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

# Include auth routes
app.include_router(auth_router)

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

# ✅ Updated Authentication dependency - Using unified auth system
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Legacy authentication - kept for backward compatibility"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Check if database is available
        if DATABASE_AVAILABLE:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user is None:
                raise HTTPException(status_code=401, detail="User not found")
            return user
        else:
            # Create mock user when database is not available
            from model import User
            mock_user = User()
            mock_user.id = int(user_id)
            mock_user.username = "test"
            mock_user.email = "test@example.com"
            return mock_user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Wrapper for Supabase auth - kept for backward compatibility
def get_current_user_supabase_wrapper(
    current_user: User = Depends(get_current_user_supabase)
):
    return current_user

# Email token functions
def generate_token(email:str):
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    return serializer.dumps(email, salt='email-reset-salt')

def verify_token(token:str):
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    try:
        email = serializer.loads(token, salt='email-reset-salt', max_age=3600)
        return email
    except:
        return None

# Email password reset endpoints
@app.post("/forgot-password")
async def forgot_password(email: str = Form(...)):
    """Send password reset email"""
    if not DATABASE_AVAILABLE:
        return {"message": "Password reset email sent (mock)"}
    
    # Check if user exists
    db = next(get_db())
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate reset token
    token = generate_token(email)
    reset_url = f"http://localhost:3000/reset-password?token={token}"
    
    # Send email (mock for now)
    print(f"Password reset email sent to {email} with token: {token}")
    
    return {"message": "Password reset email sent"}

@app.post("/reset-password")
def reset_password(
    token: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Reset password with token"""
    if not DATABASE_AVAILABLE:
        return {"message": "Password reset successful (mock)"}
    
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Hash new password
    hashed_password = pwd_context.hash(new_password)
    user.password = hashed_password
    db.commit()
    
    return {"message": "Password reset successful"}

# Legacy registration endpoint - now redirects to new auth system
@app.post("/register", response_model=LoginResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Legacy registration endpoint - redirects to new auth system"""
    # This endpoint is kept for backward compatibility
    # The actual registration is now handled by auth_routes.py
    raise HTTPException(status_code=308, detail="Please use /auth/register endpoint")

# Legacy login endpoint - now redirects to new auth system
@app.post("/login", response_model=LoginResponse)
async def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Legacy login endpoint - redirects to new auth system"""
    # This endpoint is kept for backward compatibility
    # The actual login is now handled by auth_routes.py
    raise HTTPException(status_code=308, detail="Please use /auth/login endpoint")

# Business Logic Endpoints - Updated to use unified auth

@app.post("/expenses")
async def create_expenses(
    bulk_expenses: ExpenseCreateBulk,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Create bulk expenses for the authenticated user"""
    # Use current_user.id instead of bulk_expenses.user_id for security
    bulk_expenses.user_id = str(current_user.id)
    
    if not DATABASE_AVAILABLE:
        return {"message": "Expenses created successfully (mock)"}
    
    # Create expenses
    expenses = []
    for category, amount in bulk_expenses.categories.dict().items():
        if amount > 0:
            expense = Expense(
                user_id=current_user.id,
                month=bulk_expenses.month,
                category=category,
                amount=amount
            )
            db.add(expense)
            expenses.append(expense)
    
    db.commit()
    return {"message": f"Created {len(expenses)} expenses"}

@app.get("/expenses/{user_id}", response_model=List[ExpenseResponse])
async def get_expenses(
    user_id: int,
    month: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Get expenses for a user (only if authenticated user matches)"""
    # Security check: only allow users to access their own data
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not DATABASE_AVAILABLE:
        # Return mock data
        return [
            ExpenseResponse(
                id=1,
                user_id=user_id,
                month="January",
                category="food",
                amount=500.0
            )
        ]
    
    query = db.query(Expense).filter(Expense.user_id == user_id)
    if month:
        query = query.filter(Expense.month == month)
    
    expenses = query.all()
    return [ExpenseResponse.from_orm(expense) for expense in expenses]

@app.get("/expenses", response_model=List[ExpenseResponse])
async def get_all_expenses(
    month: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Get all expenses for the authenticated user"""
    return await get_expenses(current_user.id, month, db, current_user)

@app.post("/predict-expense", response_model=PredictionResponse)
async def predict_expense_endpoint(
    input: ExpensePredictInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Predict expenses for the authenticated user"""
    # Use current_user.id instead of input.user_id for security
    input.user_id = str(current_user.id)
    
    # Try ML model first
    try:
        prediction = predict_expense(input.income, input.user_id, input.month)
        return PredictionResponse(prediction=prediction)
    except Exception as e:
        # Fallback to realistic predictions
        realistic_prediction = get_realistic_predictions(input.income, input.month)
        return PredictionResponse(prediction=realistic_prediction)

@app.post("/predict/savings", response_model=PredictionResponse)
async def predict_savings_endpoint(
    input: SavingsPredictionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Predict savings for the authenticated user"""
    # Use current_user.id instead of input.user_id for security
    input.user_id = str(current_user.id)
    
    # Try ML model first
    try:
        prediction = predict_savings(input.income, input.user_id, input.month)
        return PredictionResponse(prediction=prediction)
    except Exception as e:
        # Fallback to realistic predictions
        realistic_prediction = input.income * 0.3  # 30% savings rate
        return PredictionResponse(prediction=realistic_prediction)

@app.post("/predict/6-month-forecast")
async def predict_6_month_forecast(
    user_id: int = Body(..., embed=True),
    income: float = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Generate 6-month forecast for the authenticated user"""
    # Security check: only allow users to access their own data
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        forecast = generate_6_month_forecast(user_id, income)
        return {"forecast": forecast, "can_show_forecast": True}
    except Exception as e:
        return {"error": str(e), "can_show_forecast": False}

@app.post("/transactions", response_model=TransactionResponse)
async def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Create a transaction for the authenticated user"""
    # Use current_user.id instead of transaction.user_id for security
    transaction.user_id = current_user.id
    
    if not DATABASE_AVAILABLE:
        return TransactionResponse(
            id=1,
            user_id=current_user.id,
            type=transaction.type,
            description=transaction.description,
            amount=transaction.amount,
            category=transaction.category,
            date=transaction.date
        )
    
    # Verify user exists
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return TransactionResponse.from_orm(db_transaction)

@app.get("/transactions/{user_id}", response_model=List[TransactionResponse])
async def get_transactions(
    user_id: int,
    limit: Optional[int] = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Get transactions for a user (only if authenticated user matches)"""
    # Security check: only allow users to access their own data
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not DATABASE_AVAILABLE:
        # Return mock data
        return [
            TransactionResponse(
                id=1,
                user_id=user_id,
                type="expense",
                description="Mock transaction",
                amount=100.0,
                category="food",
                date="2024-01-01"
            )
        ]
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).limit(limit).all()
    
    return [TransactionResponse.from_orm(t) for t in transactions]

@app.put("/users/{user_id}/savings-goal")
async def update_savings_goal(
    user_id: int,
    savings_goal: float = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Update savings goal for the authenticated user"""
    # Security check: only allow users to access their own data
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not DATABASE_AVAILABLE:
        return {"message": "Savings goal updated successfully (mock)"}
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.savings_goal = savings_goal
    db.commit()
    
    return {"message": "Savings goal updated successfully"}

@app.get("/users/{user_id}/savings-goal")
async def get_savings_goal(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Get savings goal for the authenticated user"""
    # Security check: only allow users to access their own data
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not DATABASE_AVAILABLE:
        return {"savings_goal": 10000.0}
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"savings_goal": user.savings_goal or DEFAULT_SAVINGS_GOAL}

@app.post("/users/{user_id}/calculate-savings-goal")
async def calculate_savings_goal(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Calculate smart savings goal for the authenticated user"""
    # Security check: only allow users to access their own data
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not DATABASE_AVAILABLE:
        return {"savings_goal": 8000.0, "calculation_method": "mock"}
    
    # Get user's recent expenses to calculate smart savings goal
    recent_expenses = db.query(Expense).filter(
        Expense.user_id == user_id
    ).order_by(Expense.id.desc()).limit(12).all()
    
    if not recent_expenses:
        # No expense data, use default calculation
        smart_goal = DEFAULT_SAVINGS_GOAL
        method = "default"
    else:
        # Calculate average monthly expenses
        total_expenses = sum(expense.amount for expense in recent_expenses)
        avg_monthly_expenses = total_expenses / len(recent_expenses)
        
        # Smart savings goal: 6 months of expenses + 20% buffer
        smart_goal = avg_monthly_expenses * 6 * 1.2
        method = "expense_based"
    
    # Update user's savings goal
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.savings_goal = smart_goal
        db.commit()
    
    return {
        "savings_goal": smart_goal,
        "calculation_method": method
    }

@app.get("/dashboard/{user_id}", response_model=DashboardData)
async def get_dashboard_data(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Get dashboard data for the authenticated user"""
    # Security check: only allow users to access their own data
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not DATABASE_AVAILABLE:
        # Return mock dashboard data
        return DashboardData(
            summary=FinancialSummary(
                total_balance=5000.0,
                monthly_income=3000.0,
                monthly_expenses=2000.0,
                savings_goal=10000.0,
                current_savings=5000.0,
                last_month_expenses=1800.0,
                last_month_income=3000.0,
                last_month_balance=4200.0
            ),
            spending_categories=[
                SpendingCategory(category="Food", amount=500.0, percentage=25.0),
                SpendingCategory(category="Transport", amount=300.0, percentage=15.0),
                SpendingCategory(category="Entertainment", amount=200.0, percentage=10.0)
            ],
            recent_transactions=[
                TransactionResponse(
                    id=1,
                    user_id=user_id,
                    type="expense",
                    description="Grocery shopping",
                    amount=100.0,
                    category="food",
                    date="2024-01-15"
                )
            ]
        )
    
    # Get recent transactions
    recent_transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).order_by(Transaction.id.desc()).limit(5).all()
    
    # Get current month expenses
    current_month = datetime.now().strftime("%B")
    current_month_expenses = db.query(Expense).filter(
        Expense.user_id == user_id,
        Expense.month == current_month
    ).all()
    
    # Calculate spending categories
    category_totals = {}
    total_expenses = 0
    
    for expense in current_month_expenses:
        category_totals[expense.category] = category_totals.get(expense.category, 0) + expense.amount
        total_expenses += expense.amount
    
    spending_categories = []
    for category, amount in category_totals.items():
        percentage = (amount / total_expenses * 100) if total_expenses > 0 else 0
        spending_categories.append(SpendingCategory(
            category=category,
            amount=amount,
            percentage=percentage
        ))
    
    # Sort categories by amount (descending)
    spending_categories.sort(key=lambda x: x.amount, reverse=True)
    
    # Get user info
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate financial summary
    monthly_income = user.monthly_income or 0
    current_savings = user.current_savings or 0
    savings_goal = user.savings_goal or DEFAULT_SAVINGS_GOAL
    
    # Mock last month data (in real app, this would come from historical data)
    last_month_expenses = total_expenses * 0.9  # 10% less than current month
    last_month_income = monthly_income
    last_month_balance = last_month_income - last_month_expenses
    
    summary = FinancialSummary(
        total_balance=current_savings,
        monthly_income=monthly_income,
        monthly_expenses=total_expenses,
        savings_goal=savings_goal,
        current_savings=current_savings,
        last_month_expenses=last_month_expenses,
        last_month_income=last_month_income,
        last_month_balance=last_month_balance
    )
    
    return DashboardData(
        summary=summary,
        spending_categories=spending_categories,
        recent_transactions=[TransactionResponse.from_orm(t) for t in recent_transactions]
    )

# Feedback endpoints
@app.post("/feedback")
async def submit_feedback(
    message: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Submit feedback from the authenticated user"""
    if not DATABASE_AVAILABLE:
        return {"message": "Feedback submitted successfully (mock)"}
    
    feedback = Feedback(
        user_id=current_user.id,
        message=message,
        created_at=datetime.utcnow()
    )
    
    db.add(feedback)
    db.commit()
    
    return {"message": "Feedback submitted successfully"}

@app.get("/feedback")
async def get_feedback(db: Session = Depends(get_db), current_user: User = Depends(get_current_user_any)):
    """Get feedback from the authenticated user"""
    if not DATABASE_AVAILABLE:
        return [{"id": 1, "message": "Mock feedback", "created_at": "2024-01-01"}]
    
    feedback = db.query(Feedback).filter(
        Feedback.user_id == current_user.id
    ).order_by(Feedback.created_at.desc()).all()
    
    return [
        {
            "id": f.id,
            "message": f.message,
            "created_at": f.created_at.isoformat()
        }
        for f in feedback
    ]

# Asset management endpoints
@app.post("/assets", response_model=AssetResponse)
def add_asset(
    asset: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Add an asset for the authenticated user"""
    if not DATABASE_AVAILABLE:
        return AssetResponse(
            id=1,
            user_id=current_user.id,
            name=asset.name,
            type=asset.type,
            symbol=asset.symbol,
            quantity=asset.quantity,
            purchase_price=asset.purchase_price,
            current_price=asset.purchase_price,
            purchase_date=asset.purchase_date
        )
    
    db_asset = Asset(**asset.dict(), user_id=current_user.id)
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    
    return AssetResponse.from_orm(db_asset)

@app.get("/assets", response_model=List[AssetResponse])
def list_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """List all assets for the authenticated user"""
    if not DATABASE_AVAILABLE:
        return [
            AssetResponse(
                id=1,
                user_id=current_user.id,
                name="Mock Stock",
                type="stock",
                symbol="MOCK",
                quantity=10,
                purchase_price=100.0,
                current_price=110.0,
                purchase_date="2024-01-01"
            )
        ]
    
    assets = db.query(Asset).filter(Asset.user_id == current_user.id).all()
    return [AssetResponse.from_orm(asset) for asset in assets]

def fetch_yahoo_price(symbol: str, asset_type: str) -> float:
    """Fetch current price from Yahoo Finance"""
    try:
        if asset_type == "stock":
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return info.get('regularMarketPrice', 0.0)
        elif asset_type == "crypto":
            ticker = yf.Ticker(f"{symbol}-USD")
            info = ticker.info
            return info.get('regularMarketPrice', 0.0)
        else:
            return 0.0
    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
        return 0.0

@app.get("/portfolio/overview", response_model=PortfolioOverviewResponse)
def portfolio_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Get portfolio overview for the authenticated user"""
    if not DATABASE_AVAILABLE:
        return PortfolioOverviewResponse(
            total_value=10000.0,
            total_invested=9000.0,
            total_gain_loss=1000.0,
            gain_loss_percentage=11.11,
            assets=[
                AssetResponse(
                    id=1,
                    user_id=current_user.id,
                    name="Mock Stock",
                    type="stock",
                    symbol="MOCK",
                    quantity=10,
                    purchase_price=100.0,
                    current_price=110.0,
                    purchase_date="2024-01-01"
                )
            ]
        )
    
    assets = db.query(Asset).filter(Asset.user_id == current_user.id).all()
    
    total_invested = sum(asset.purchase_price * asset.quantity for asset in assets)
    total_value = 0
    updated_assets = []
    
    for asset in assets:
        # Fetch current price
        current_price = fetch_yahoo_price(asset.symbol, asset.type)
        asset.current_price = current_price
        
        # Calculate asset value
        asset_value = current_price * asset.quantity
        total_value += asset_value
        
        updated_assets.append(AssetResponse.from_orm(asset))
    
    total_gain_loss = total_value - total_invested
    gain_loss_percentage = (total_gain_loss / total_invested * 100) if total_invested > 0 else 0
    
    return PortfolioOverviewResponse(
        total_value=total_value,
        total_invested=total_invested,
        total_gain_loss=total_gain_loss,
        gain_loss_percentage=gain_loss_percentage,
        assets=updated_assets
    )

@app.post("/portfolio/snapshot")
def save_snapshot(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Save portfolio snapshot for the authenticated user"""
    if not DATABASE_AVAILABLE:
        return {"message": "Snapshot saved successfully (mock)"}
    
    assets = db.query(Asset).filter(Asset.user_id == current_user.id).all()
    
    snapshot_data = {
        "user_id": current_user.id,
        "timestamp": datetime.utcnow(),
        "assets": [
            {
                "symbol": asset.symbol,
                "quantity": asset.quantity,
                "price": asset.current_price or asset.purchase_price
            }
            for asset in assets
        ]
    }
    
    snapshot = PortfolioSnapshot(
        user_id=current_user.id,
        snapshot_data=json.dumps(snapshot_data),
        created_at=datetime.utcnow()
    )
    
    db.add(snapshot)
    db.commit()
    
    return {"message": "Snapshot saved successfully"}

@app.get("/portfolio/history", response_model=List[PortfolioSnapshotResponse])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Get portfolio history for the authenticated user"""
    if not DATABASE_AVAILABLE:
        return [
            PortfolioSnapshotResponse(
                id=1,
                user_id=current_user.id,
                snapshot_data={"total_value": 10000.0},
                created_at="2024-01-01T00:00:00"
            )
        ]
    
    snapshots = db.query(PortfolioSnapshot).filter(
        PortfolioSnapshot.user_id == current_user.id
    ).order_by(PortfolioSnapshot.created_at.desc()).limit(30).all()
    
    return [PortfolioSnapshotResponse.from_orm(s) for s in snapshots]

@app.put("/assets/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int = Path(...),
    asset: AssetCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Update an asset for the authenticated user"""
    if not DATABASE_AVAILABLE:
        return AssetResponse(
            id=asset_id,
            user_id=current_user.id,
            name=asset.name,
            type=asset.type,
            symbol=asset.symbol,
            quantity=asset.quantity,
            purchase_price=asset.purchase_price,
            current_price=asset.purchase_price,
            purchase_date=asset.purchase_date
        )
    
    db_asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    for key, value in asset.dict().items():
        setattr(db_asset, key, value)
    
    db.commit()
    db.refresh(db_asset)
    
    return AssetResponse.from_orm(db_asset)

@app.delete("/assets/{asset_id}")
def delete_asset(
    asset_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Delete an asset for the authenticated user"""
    if not DATABASE_AVAILABLE:
        return {"message": "Asset deleted successfully (mock)"}
    
    db_asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    db.delete(db_asset)
    db.commit()
    
    return {"message": "Asset deleted successfully"}

@app.put("/users/{user_id}/current-savings")
async def update_current_savings(
    user_id: int,
    current_savings: float = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_any)
):
    """Update current savings for the authenticated user"""
    # Security check: only allow users to access their own data
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not DATABASE_AVAILABLE:
        return {"message": "Current savings updated successfully (mock)"}
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.current_savings = current_savings
    db.commit()
    
    return {"message": "Current savings updated successfully"}

# Legacy auth endpoints - kept for backward compatibility but deprecated

@app.post("/auth/token/validate")
async def validate_token(
    token: str = Body(..., embed=True)
):
    """Legacy token validation - redirects to new auth system"""
    raise HTTPException(status_code=308, detail="Please use /auth/validate endpoint")

@app.post("/auth/supabase/verify")
async def verify_supabase_token(
    token: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Legacy Supabase token verification - redirects to new auth system"""
    raise HTTPException(status_code=308, detail="Please use /auth/validate endpoint")

@app.post("/auth/logout")
async def logout(
    current_user: User = Depends(get_current_user_supabase)
):
    """Legacy logout - redirects to new auth system"""
    raise HTTPException(status_code=308, detail="Please use /auth/logout endpoint")

@app.post("/auth/supabase/signout")
async def supabase_signout(
    current_user: User = Depends(get_current_user_supabase)
):
    """Legacy Supabase signout - redirects to new auth system"""
    raise HTTPException(status_code=308, detail="Please use /auth/logout endpoint")

@app.post("/auth/supabase/refresh")
async def refresh_supabase_token(
    refresh_token: str = Body(..., embed=True)
):
    """Legacy Supabase token refresh - redirects to new auth system"""
    raise HTTPException(status_code=308, detail="Please use /auth/refresh endpoint")

@app.get("/auth/google/signup")
async def google_oauth_signup():
    """Legacy Google OAuth signup - redirects to new auth system"""
    raise HTTPException(status_code=308, detail="Please use /auth/oauth/google endpoint")

@app.get("/auth/google/login")
async def google_oauth_login():
    """Legacy Google OAuth login - redirects to new auth system"""
    raise HTTPException(status_code=308, detail="Please use /auth/oauth/google endpoint")

# Root and health endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Wealthify Backend API",
        "version": "1.0.0",
        "auth_endpoints": {
            "login": "/auth/login",
            "register": "/auth/register",
            "logout": "/auth/logout",
            "validate": "/auth/validate",
            "oauth_google": "/auth/oauth/google",
            "oauth_github": "/auth/oauth/github"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "available" if DATABASE_AVAILABLE else "unavailable",
        "timestamp": datetime.utcnow().isoformat()
    }
