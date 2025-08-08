from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Float, Boolean, DateTime, func
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from fastapi import HTTPException
from dotenv import load_dotenv
import os
from datetime import datetime

# ✅ Load environment variables
load_dotenv()

# ✅ Read DATABASE_URL from .env (Supabase connection string)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ No DATABASE_URL found in environment variables")

# Fix the DATABASE_URL to use correct Supabase format
if DATABASE_URL:
    # Convert the .env format to correct Supabase pooler format
    if "db.hfiwgtdfquqxwpkogojm.supabase.co" in DATABASE_URL:
        # Extract password from current URL
        password = "QlLbXGoMLeNLNd2M"
        # Build correct Supabase pooler URL
        DATABASE_URL = f"postgresql://postgres.hfiwgtdfquqxwpkogojm:{password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
        print("✅ Fixed DATABASE_URL format for Supabase pooler")
    else:
        print(f"✅ Using DATABASE_URL from environment")
else:
    print("❌ No DATABASE_URL found in environment variables")

# ✅ SQLAlchemy engine and session setup
try:
    engine = create_engine(DATABASE_URL, echo=True)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base = declarative_base()
    
    # Test the connection
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("✅ Database connection successful")
    DATABASE_AVAILABLE = True
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    print("⚠️  Database not available")
    engine = None
    SessionLocal = None
    Base = declarative_base()
    DATABASE_AVAILABLE = False

# ✅ User model with Supabase integration
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True, nullable=True)  # Made nullable for Supabase Auth
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)  # Made nullable for Supabase Auth
    savings_goal = Column(Float, default=float(os.getenv("DEFAULT_SAVINGS_GOAL", "10000.0")))
    current_savings = Column(Float, default=0.0)  # User-editable current savings
    is_admin = Column(Boolean, default=False)
    # Supabase Auth fields
    supabase_id = Column(String, unique=True, index=True, nullable=True)  # Supabase Auth UUID
    oauth_provider = Column(String, nullable=True)  # OAuth provider (google, github, etc.)
    oauth_id = Column(String, nullable=True)  # OAuth provider user ID
    avatar_url = Column(String, nullable=True)  # User avatar URL
    assets = relationship("Asset", back_populates="user", cascade="all, delete-orphan")
    snapshots = relationship("PortfolioSnapshot", back_populates="user", cascade="all, delete-orphan")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ✅ Expense model
class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month = Column(String, nullable=False)
    rent = Column(Float, default=0.0)
    loan_repayment = Column(Float, default=0.0)
    insurance = Column(Float, default=0.0)
    groceries = Column(Float, default=0.0)
    transport = Column(Float, default=0.0)
    eating_out = Column(Float, default=0.0)
    entertainment = Column(Float, default=0.0)
    utilities = Column(Float, default=0.0)
    healthcare = Column(Float, default=0.0)
    education = Column(Float, default=0.0)
    miscellaneous = Column(Float, default=0.0)
    total_expense = Column(Float, default=0.0)

# ✅ Transaction model
class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # "income" or "expense"
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date = Column(String, nullable=False)
    recurring = Column(Boolean, default=False)  # Add recurring field
    created_at = Column(String, default=lambda: datetime.now().isoformat())

# ✅ Feedback model
class Feedback(Base):
    __tablename__ = 'feedback'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(String, default=lambda: datetime.now().isoformat())

# ✅ Asset model
class Asset(Base):
    __tablename__ = 'assets'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)  # e.g., "bitcoin"
    symbol = Column(String, index=True)  # e.g., "btc"
    quantity = Column(Float)
    buy_price = Column(Float)
    buy_date = Column(DateTime, default=datetime.utcnow)
    type = Column(String, default="crypto")

    user = relationship("User", back_populates="assets")

# ✅ Portfolio snapshot model
class PortfolioSnapshot(Base):
    __tablename__ = 'portfolio_snapshots'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    value = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="snapshots")

# ✅ Creates tables if not present
if DATABASE_AVAILABLE and engine:
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified successfully")
    except Exception as e:
        print(f"❌ Failed to create database tables: {e}")
        print("⚠️  Application will continue but database operations may fail")
else:
    print("⚠️  Database not available, skipping table creation")

# ✅ Dependency for DB session
def get_db():
    if not DATABASE_AVAILABLE or not SessionLocal:
        raise HTTPException(status_code=503, detail="Database not available")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
