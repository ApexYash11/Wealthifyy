from fastapi import FastAPI, Depends, HTTPException, Form, Body, Path
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, List
import os
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
from ml_model import predict_expense, predict_savings

# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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

# ✅ Authentication dependency
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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



# ✅ User Registration
@app.post("/register", response_model=LoginResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    password_hash = pwd_context.hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=password_hash
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token for the new user
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = jwt.encode(
        {"sub": str(new_user.id), "exp": datetime.utcnow() + access_token_expires},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return {
        "token": access_token,
        "user": {
            "id": str(new_user.id),
            "email": new_user.email,
            "name": new_user.username,
            "created_at": new_user.created_at.isoformat() if new_user.created_at is not None else None
        }
    }

from fastapi import Form

@app.post("/login", response_model=LoginResponse)
async def login(
    username: str = Form(...),  # 👈 not Pydantic model
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user or not pwd_context.verify(password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

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
    prediction = predict_expense(input.user_id, input.month, db)
    return PredictionResponse(prediction=prediction, month=input.month)

# ✅ Savings prediction endpoint
@app.post("/predict/savings", response_model=PredictionResponse)
async def predict_savings_endpoint(
    input: SavingsPredictionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prediction = predict_savings(input.user_id, input.month, input.income, db)
    return PredictionResponse(prediction=prediction, month=input.month)

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
    
    # Calculate total balance (all income - all expenses)
    total_income = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income"
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0.0
    
    total_expenses = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense"
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0.0
    
    total_balance = total_income - total_expenses

    # Calculate last month's income and expenses
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
    # Use user's savings_goal from DB
    savings_goal = user.savings_goal if user.savings_goal is not None else 10000.0
    current_savings = max(0, total_balance * 0.2)  # 20% of balance as savings
    
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

@app.put("/users/{user_id}/savings-goal")
async def update_savings_goal(
    user_id: int,
    new_goal: float = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"Received request to update savings_goal for user_id={user_id} to {new_goal}")
    user = db.query(User).filter(User.id == user_id).first()
    print("Fetched user:", user)
    if not user:
        print("User not found!")
        raise HTTPException(status_code=404, detail="User not found")
    user.savings_goal = new_goal  # type: ignore
    db.commit()
    db.refresh(user)
    print("Updated savings_goal:", user.savings_goal)
    return {"message": "Savings goal updated", "savings_goal": user.savings_goal}

@app.post("/feedback")
async def submit_feedback(
    message: str = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    feedback = Feedback(user_id=current_user.id, message=message)
    db.add(feedback)
    db.commit()
    return {"message": "Feedback submitted"}

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

# ✅ Local dev server (optional)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
else:
    from scheduler import start_scheduler
    start_scheduler()
