from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import login_user, signup_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserRead)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    return signup_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return login_user(db, payload)

