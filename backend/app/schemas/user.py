from pydantic import BaseModel, ConfigDict, EmailStr

from app.utils.enums import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.MEMBER


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: UserRole

