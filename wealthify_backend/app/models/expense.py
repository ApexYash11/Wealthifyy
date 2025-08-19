from sqlalchemy import Column, Integer, ForeignKey, Float, String
from sqlalchemy.orm import relationship

from app.core.database import Base

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

    user = relationship("User", back_populates="expenses")
