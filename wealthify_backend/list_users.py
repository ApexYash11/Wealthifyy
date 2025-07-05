from model import engine, User
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("All users in the database:")
for u in db.query(User).all():
    print(f"ID: {u.id}, Username: {u.username}, Email: {u.email}")
db.close() 