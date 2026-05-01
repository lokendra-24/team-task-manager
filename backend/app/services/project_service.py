from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.utils.enums import UserRole


def can_access_project(user: User, project: Project) -> bool:
    return user.role == UserRole.ADMIN or any(member.id == user.id for member in project.members)


def list_projects_for_user(

    db: Session, user: User, limit: int = 10, offset: int = 0
) -> tuple[list[Project], int]:
    query = select(Project)
    total_query = select(func.count(Project.id))

    if user.role != UserRole.ADMIN:
        query = query.where(Project.members.any(id=user.id))
        total_query = total_query.where(Project.members.any(id=user.id))

    total = db.scalar(total_query)
    items = db.scalars(query.offset(offset).limit(limit)).unique().all()
    return items, total


def create_project(db: Session, user: User, payload: ProjectCreate) -> Project:
    members = []
    if payload.member_ids:
        members = db.scalars(select(User).where(User.id.in_(payload.member_ids))).all()
    project = Project(
        name=payload.name,
        description=payload.description,
        owner_id=user.id,
        members=members,
    )
    if user not in project.members:
        project.members.append(user)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project: Project, payload: ProjectUpdate) -> Project:
    for field in ("name", "description"):
        value = getattr(payload, field)
        if value is not None:
            setattr(project, field, value)
    if payload.member_ids is not None:
        members = db.scalars(select(User).where(User.id.in_(payload.member_ids))).all()
        project.members = members
    db.commit()
    db.refresh(project)
    return project


def get_project_or_404(db: Session, project_id: int) -> Project:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

