from datetime import date

from fastapi import HTTPException
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate
from app.utils.enums import TaskStatus, UserRole


def is_overdue(task: Task) -> bool:
    return bool(task.due_date and task.due_date < date.today() and task.status != TaskStatus.DONE)


def can_access_project(user: User, project: Project) -> bool:
    return user.role == UserRole.ADMIN or any(member.id == user.id for member in project.members)


def list_tasks(
    db: Session,
    user: User,
    project_id: int | None = None,
    assignee_id: int | None = None,
    status: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    sort_by: str = "due_date",
    limit: int = 10,
    offset: int = 0,
) -> tuple[list[Task], int]:
    query = select(Task).join(Project, Task.project_id == Project.id)
    total_query = select(func.count(Task.id)).join(Project, Task.project_id == Project.id)

    if user.role != UserRole.ADMIN:
        query = query.where(Project.members.any(id=user.id))
        total_query = total_query.where(Project.members.any(id=user.id))
    if project_id:
        query = query.where(Task.project_id == project_id)
        total_query = total_query.where(Task.project_id == project_id)
    if assignee_id:
        query = query.where(Task.assignee_id == assignee_id)
        total_query = total_query.where(Task.assignee_id == assignee_id)

    if status:
        query = query.where(Task.status == status)
        total_query = total_query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)
        total_query = total_query.where(Task.priority == priority)
    if search:
        query = query.where(Task.title.ilike(f"%{search}%"))
        total_query = total_query.where(Task.title.ilike(f"%{search}%"))
    
    total = db.scalar(total_query)

    sort_map = {
        "due_date": Task.due_date,
        "priority": Task.priority,
        "status": Task.status,
        "created_at": Task.created_at,
    }
    query = query.order_by(sort_map.get(sort_by, Task.due_date)).offset(offset).limit(limit)
    items = db.scalars(query).all()
    return items, total


from app.services.activity_service import log_activity

def create_task(db: Session, user: User, payload: TaskCreate) -> Task:
    project = db.get(Project, payload.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not can_access_project(user, project):
        raise HTTPException(status_code=403, detail="No project access")
    
    task_data = payload.model_dump()
    task = Task(**task_data, creator_id=user.id)
    db.add(task)
    db.flush() # get task.id
    
    log_activity(
        db, user.id, task.project_id, 
        action="created_task", target_type="task", target_id=task.id,
        details=f"Created task: {task.title}"
    )
    
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, user: User, task: Task, payload: TaskUpdate) -> Task:
    project = db.get(Project, task.project_id)
    if not project or not can_access_project(user, project):
        raise HTTPException(status_code=403, detail="No task access")
    
    old_status = task.status
    update_data = payload.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(task, key, value)
    
    if "status" in update_data and update_data["status"] != old_status:
        log_activity(
            db, user.id, task.project_id,
            action="updated_status", target_type="task", target_id=task.id,
            details=f"Changed status: {old_status} -> {task.status}"
        )
    elif "assignee_id" in update_data:
         log_activity(
            db, user.id, task.project_id,
            action="assigned_task", target_type="task", target_id=task.id,
            details=f"Updated assignment"
        )

    db.commit()
    db.refresh(task)
    return task


def get_task_or_404(db: Session, task_id: int) -> Task:
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

