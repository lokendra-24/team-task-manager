from sqlalchemy.orm import Session
from app.models.activity import Activity

def log_activity(
    db: Session,
    user_id: int,
    project_id: int,
    action: str,
    target_type: str,
    target_id: int,
    details: str | None = None
):
    activity = Activity(
        user_id=user_id,
        project_id=project_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details
    )
    db.add(activity)
    # We don't commit here, we assume the caller will commit as part of the transaction
