from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean, DateTime, func, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import os

from app.core.database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    savings_goal = Column(Float, default=float(os.getenv("DEFAULT_SAVINGS_GOAL", "10000.0")))
    current_savings = Column(Float, default=0.0)
    is_admin = Column(Boolean, default=False)

    # Supabase Auth fields
    supabase_id = Column(String, unique=True, index=True, nullable=True)
    is_email_verified = Column(Boolean, default=False)
    oauth_provider = Column(String, nullable=True)  # 'google', 'github', etc.
    oauth_id = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    oauth_data = Column(JSON, nullable=True)  # Store additional OAuth data as JSON
    last_sign_in_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    assets = relationship("Asset", back_populates="user", cascade="all, delete-orphan")
    snapshots = relationship("PortfolioSnapshot", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
