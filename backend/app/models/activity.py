from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    
    # action: "created_task", "updated_status", "assigned_member", etc.
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Details about what changed (e.g., "Todo -> In Progress")
    details: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    target_type: Mapped[str] = mapped_column(String(50), nullable=False)  # "task", "project", etc.
    target_id: Mapped[int] = mapped_column(Integer, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project")
    user = relationship("User")
