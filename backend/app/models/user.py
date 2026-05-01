from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.utils.enums import UserRole


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", values_callable=lambda enum: [e.value for e in enum]),
        nullable=False,
        default=UserRole.MEMBER,
    )

    owned_projects = relationship("Project", back_populates="owner", cascade="all,delete")
    assigned_tasks = relationship("Task", foreign_keys="[Task.assignee_id]", back_populates="assignee")
    created_tasks = relationship("Task", foreign_keys="[Task.creator_id]", back_populates="creator")


