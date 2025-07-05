from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Schema for user registration input
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

# Schema for JWT token response
class Token(BaseModel):
    access_token: str
    token_type: str

# Schema for login response with user info
class LoginResponse(BaseModel):
    token: str
    user: dict

# Schema for a single expense entry
class ExpenseCreate(BaseModel):
    user_id: int
    month: str
    rent: float
    loan_repayment: float
    insurance: float
    groceries: float
    transport: float
    eating_out: float
    entertainment: float
    utilities: float
    healthcare: float
    education: float
    miscellaneous: float
    total_expense: float

# Schema for expense response with ID
class ExpenseResponse(ExpenseCreate):
    id: int

# Schema for bulk expense creation
class ExpenseCreateBulk(BaseModel):
    expenses: List[ExpenseCreate]

# Schema for expense prediction input
class ExpensePredictInput(BaseModel):
    user_id: int
    month: str

# Schema for savings prediction input
class SavingsPredictionInput(BaseModel):
    user_id: int
    month: str
    income: float

# Schema for prediction response
class PredictionResponse(BaseModel):
    prediction: float
    month: str

# Schema for transaction
class TransactionCreate(BaseModel):
    user_id: int
    type: str  # "income" or "expense"
    description: str
    amount: float
    category: str
    date: str

class TransactionResponse(TransactionCreate):
    id: int

# Schema for financial summary
class FinancialSummary(BaseModel):
    total_balance: float
    monthly_income: float
    monthly_expenses: float
    savings_goal: float
    current_savings: float
    last_month_balance: float
    last_month_income: float
    last_month_expenses: float

# Schema for spending category
class SpendingCategory(BaseModel):
    category: str
    amount: float
    percentage: float

# Schema for dashboard data
class DashboardData(BaseModel):
    summary: FinancialSummary
    recent_transactions: List[TransactionResponse]
    spending_categories: List[SpendingCategory]

# Schema for forgot password request
class ForgotPasswordRequest(BaseModel):
  email: EmailStr

# Schema for reset password request
class ResetPasswordRequest(BaseModel):
  token: str
  new_password: str


#Schema for assent base 
class AssentBase(BaseModel):
    name: str
    symbol: str
    quantity: float
    buy_price: float
    type: str

# schema for asset create 
class AssetCreate(AssentBase):
    pass 

# schema for asset response 
class AssetResponse(AssentBase):
    id: int
    buy_date: datetime

    class Config:
        orm_mode = True

# schema for portfolio snapshot response 
class PortfolioSnapshotResponse(BaseModel):
    value: float
    timestamp: datetime 
    
    class config:
        orm_mode = True


#schema for portfolio overview response 
class PortfolioOverviewResponse(BaseModel):
    total_value: float
    invested_total: float
    gain_loss: float
    percent_change: float
    assets: List[AssetResponse]

