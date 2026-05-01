from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session


from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User
from app.schemas.pagination import PaginatedResponse
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.schemas.activity import ActivityRead
from app.models.activity import Activity
from app.services.project_service import (
    create_project,
    get_project_or_404,
    list_projects_for_user,
    update_project,
    can_access_project,
)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_project_or_404(db, project_id)
    if not can_access_project(current_user, project):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="No project access")
    return project


@router.get("/{project_id}/activities", response_model=list[ActivityRead])
def list_activities(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_project_or_404(db, project_id)
    if not can_access_project(current_user, project):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="No project access")
    
    activities = db.scalars(
        select(Activity)
        .where(Activity.project_id == project_id)
        .order_by(Activity.created_at.desc())
        .limit(50)
    ).all()
    return activities



@router.get("", response_model=PaginatedResponse[ProjectRead])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    items, total = list_projects_for_user(db, current_user, limit, offset)
    return {"items": items, "total": total}


@router.post("", response_model=ProjectRead, dependencies=[Depends(require_admin)])
def create(payload: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_project(db, current_user, payload)


@router.put("/{project_id}", response_model=ProjectRead, dependencies=[Depends(require_admin)])
def update(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
):
    project = get_project_or_404(db, project_id)
    return update_project(db, project, payload)


@router.delete("/{project_id}", dependencies=[Depends(require_admin)])
def delete(project_id: int, db: Session = Depends(get_db)):
    project = get_project_or_404(db, project_id)
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}

