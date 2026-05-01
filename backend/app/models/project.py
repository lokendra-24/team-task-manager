from sqlalchemy import ForeignKey, String, Table, Column, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

project_members = Table(
    "project_members",
    Base.metadata,
    Column("project_id", ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    owner = relationship("User", back_populates="owned_projects")
    members = relationship("User", secondary=project_members, lazy="joined")
    tasks = relationship("Task", back_populates="project", cascade="all,delete")

