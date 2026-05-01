from collections import defaultdict

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.dashboard import DashboardResponse, DashboardStats
from app.schemas.task import TaskRead
from app.services.task_service import is_overdue, list_tasks
from app.utils.enums import TaskStatus


def get_dashboard_data(db: Session, user: User) -> DashboardResponse:
    tasks, _ = list_tasks(db=db, user=user, limit=10_000, offset=0)
    serialized: list[TaskRead] = []
    for task in tasks:
        row = TaskRead.model_validate(
            {
                **task.__dict__,
                "is_overdue": is_overdue(task),
            }
        )
        serialized.append(row)

    grouped = defaultdict(list)
    for task in serialized:
        grouped[task.status.value].append(task)

    stats = DashboardStats(
        total=len(serialized),
        completed=len([t for t in serialized if t.status == TaskStatus.DONE]),
        pending=len([t for t in serialized if t.status != TaskStatus.DONE]),
        overdue=len([t for t in serialized if t.is_overdue]),
    )
    return DashboardResponse(
        # Flat fields – required API contract
        total_tasks=stats.total,
        completed_tasks=stats.completed,
        pending_tasks=stats.pending,
        overdue_tasks=stats.overdue,
        # Legacy nested block
        stats=stats,
        grouped=dict(grouped),
    )

