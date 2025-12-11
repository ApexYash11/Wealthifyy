from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import os

from app.core.database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, nullable=True)
    email = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)  # matches your schema name
    savings_goal = Column(Float, default=10000.0)  # matches your default
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    monthly_budget = Column(Float, default=0.0)
    current_savings = Column(Float, default=0.0)
    
    # Supabase Auth fields (match your schema)
    supabase_id = Column(UUID(as_uuid=True), unique=True, nullable=True)
    oauth_provider = Column(String, nullable=True)
    oauth_id = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    # Relationships
    assets = relationship("Asset", back_populates="user", cascade="all, delete-orphan")
    snapshots = relationship("PortfolioSnapshot", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
