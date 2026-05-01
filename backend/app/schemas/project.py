from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserRead


class ProjectBase(BaseModel):
    name: str
    description: str | None = None


class ProjectCreate(ProjectBase):
    member_ids: list[int] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    member_ids: list[int] | None = None


class ProjectRead(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    members: list[UserRead]

