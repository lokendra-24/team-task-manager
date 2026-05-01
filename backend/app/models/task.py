from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.utils.enums import TaskPriority, TaskStatus


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    assignee_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    creator_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus, name="task_status", values_callable=lambda enum: [e.value for e in enum]),
        default=TaskStatus.TODO,
        nullable=False,
    )
    priority: Mapped[TaskPriority] = mapped_column(
        Enum(
            TaskPriority,
            name="task_priority",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        default=TaskPriority.MEDIUM,
        nullable=False,
    )
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="assigned_tasks")
    creator = relationship("User", foreign_keys=[creator_id], back_populates="created_tasks")


