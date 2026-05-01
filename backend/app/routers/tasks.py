from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.pagination import PaginatedResponse
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services.task_service import create_task, get_task_or_404, is_overdue, list_tasks, update_task

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=PaginatedResponse[TaskRead])
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    project_id: int | None = None,
    assignee_id: int | None = None,
    status: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    sort_by: str = Query(default="due_date"),
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    items, total = list_tasks(
        db=db,
        user=current_user,
        project_id=project_id,
        assignee_id=assignee_id,
        status=status,
        priority=priority,
        search=search,
        sort_by=sort_by,
        limit=limit,
        offset=offset,
    )

    return {
        "items": [
            TaskRead.model_validate({**task.__dict__, "is_overdue": is_overdue(task)}) for task in items
        ],
        "total": total,
    }


@router.post("", response_model=TaskRead)
def create(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = create_task(db, current_user, payload)
    return TaskRead.model_validate({**task.__dict__, "is_overdue": is_overdue(task)})


@router.put("/{task_id}", response_model=TaskRead)
def update(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task_or_404(db, task_id)
    task = update_task(db, current_user, task, payload)
    return TaskRead.model_validate({**task.__dict__, "is_overdue": is_overdue(task)})

