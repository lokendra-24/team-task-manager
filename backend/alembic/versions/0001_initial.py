"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2026-05-01 12:00:00
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    user_role = sa.Enum("admin", "member", name="user_role")
    task_status = sa.Enum("todo", "in-progress", "done", name="task_status")
    task_priority = sa.Enum("low", "medium", "high", name="task_priority")
    user_role_existing = postgresql.ENUM("admin", "member", name="user_role", create_type=False)
    task_status_existing = postgresql.ENUM(
        "todo", "in-progress", "done", name="task_status", create_type=False
    )
    task_priority_existing = postgresql.ENUM(
        "low", "medium", "high", name="task_priority", create_type=False
    )
    bind = op.get_bind()
    user_role.create(bind, checkfirst=True)
    task_status.create(bind, checkfirst=True)
    task_priority.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("full_name", sa.String(length=150), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", user_role_existing, nullable=False, server_default="member"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE")),
    )
    op.create_index("ix_projects_id", "projects", ["id"])

    op.create_table(
        "project_members",
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    )

    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id", ondelete="CASCADE")),
        sa.Column("assignee_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", task_status_existing, nullable=False, server_default="todo"),
        sa.Column("priority", task_priority_existing, nullable=False, server_default="medium"),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_tasks_id", "tasks", ["id"])


def downgrade() -> None:
    op.drop_index("ix_tasks_id", table_name="tasks")
    op.drop_table("tasks")
    op.drop_table("project_members")
    op.drop_index("ix_projects_id", table_name="projects")
    op.drop_table("projects")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    sa.Enum(name="task_priority").drop(bind, checkfirst=True)
    sa.Enum(name="task_status").drop(bind, checkfirst=True)
    sa.Enum(name="user_role").drop(bind, checkfirst=True)

