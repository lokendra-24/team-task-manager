from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.utils.enums import TaskPriority, TaskStatus
from app.schemas.user import UserRead



class TaskBase(BaseModel):
    title: str
    description: str | None = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: date | None = None
    assignee_id: int | None = None


class TaskCreate(TaskBase):
    project_id: int


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    due_date: date | None = None
    assignee_id: int | None = None


class TaskRead(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime | None = None
    is_overdue: bool
    assignee: UserRead | None = None
    creator: UserRead | None = None


