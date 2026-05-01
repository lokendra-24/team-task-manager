from pydantic import BaseModel

from app.schemas.task import TaskRead


class DashboardStats(BaseModel):
    """Internal helper – kept for the service layer."""
    total: int
    completed: int
    pending: int
    overdue: int


class DashboardResponse(BaseModel):
    """Flat response shape consumed by the frontend dashboard."""
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    # Legacy nested block – kept so no other code that reads .stats breaks
    stats: DashboardStats
    grouped: dict[str, list[TaskRead]]

