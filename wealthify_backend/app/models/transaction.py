from sqlalchemy import Column, Integer, ForeignKey, Float, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # "income" or "expense"
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)  # double precision in DB
    category = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)  # timestamp in DB, not string
    recurring = Column(Boolean, default=False)  # boolean in DB, not string
    notes = Column(String, nullable=True)  # optional notes field
    created_at = Column(DateTime)

    user = relationship("User", back_populates="transactions")
