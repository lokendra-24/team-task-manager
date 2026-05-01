from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in-progress"
    DONE = "done"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

