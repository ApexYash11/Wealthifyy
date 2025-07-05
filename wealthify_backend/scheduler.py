from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime
from model import SessionLocal, Asset, PortfolioSnapshot

scheduler = BackgroundScheduler()

@scheduler.scheduled_job("cron", hour=0, minute=0)
def daily_snapshot_job():
    db: Session = SessionLocal()
    try:
        user_ids = db.query(Asset.user_id).distinct().all()
        for (user_id,) in user_ids:
            assets = db.query(Asset).filter(Asset.user_id == user_id).all()
            total_value = sum(
                float(getattr(asset, 'buy_price', 0.0)) * float(getattr(asset, 'quantity', 0.0))
                for asset in assets
            )
            snapshot = PortfolioSnapshot(user_id=user_id, value=total_value)
            db.add(snapshot)
        db.commit()
    finally:
        db.close()

def start_scheduler():
    scheduler.start() 