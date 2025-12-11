from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class Asset(Base):
    __tablename__ = 'assets'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    symbol = Column(String, index=True)
    quantity = Column(Float)  # double precision in DB
    buy_price = Column(Float)  # double precision in DB
    # Note: current_price doesn't exist in your DB schema - removed
    buy_date = Column(DateTime, default=datetime.utcnow)
    type = Column(String, default="crypto")

    user = relationship("User", back_populates="assets")
