from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.config import get_settings

settings = get_settings()
DATABASE_URL = settings.DATABASE_URL

engine = create_engine(DATABASE_URL)
with Session(engine) as session:
    users = session.scalars(select(User)).all()
    for user in users:
        print(f"ID: {user.id}, Email: {user.email}, Name: {user.full_name}")
