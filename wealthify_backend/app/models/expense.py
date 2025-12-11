from sqlalchemy import Column, Integer, ForeignKey, Float, String
from sqlalchemy.orm import relationship

from app.core.database import Base

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    month = Column(String)
    rent = Column(Float)  # double precision in DB
    loan_repayment = Column(Float)  # double precision in DB
    insurance = Column(Float)  # double precision in DB
    groceries = Column(Float)  # double precision in DB
    transport = Column(Float)  # double precision in DB
    eating_out = Column(Float)  # double precision in DB
    entertainment = Column(Float)  # double precision in DB
    utilities = Column(Float)  # double precision in DB
    healthcare = Column(Float)  # double precision in DB
    education = Column(Float)  # double precision in DB
    miscellaneous = Column(Float)  # double precision in DB
    total_expense = Column(Float)  # double precision in DB

    user = relationship("User", back_populates="expenses")
