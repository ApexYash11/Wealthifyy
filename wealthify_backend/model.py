from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Float, Boolean, DateTime, func
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from dotenv import load_dotenv
import os
from datetime import datetime

# ✅ Load environment variables
load_dotenv()

# ✅ Read DATABASE_URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set")

# ✅ SQLAlchemy engine and session setup
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

# ✅ User model
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    savings_goal = Column(Float, default=10000.0)
    is_admin = Column(Boolean, default=False)
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
Base.metadata.create_all(bind=engine)

# ✅ Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
