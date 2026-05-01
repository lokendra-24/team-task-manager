from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_admin
from app.models.user import User
from app.schemas.user import UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead], dependencies=[Depends(require_admin)])
def list_users(db: Session = Depends(get_db)):
    users = db.scalars(select(User)).all()
    return [UserRead.model_validate(user) for user in users]

