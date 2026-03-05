"""User model for authentication and preferences."""

from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Integer, JSON, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    auth_provider: Mapped[str] = mapped_column(String(20), nullable=False, default="email")  # "email" or "google"
    password_hash: Mapped[str | None] = mapped_column(String(255))  # null for Google auth
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    last_login: Mapped[datetime | None] = mapped_column(DateTime)
    login_count: Mapped[int] = mapped_column(Integer, default=0)
    preferred_currency: Mapped[str] = mapped_column(String(3), default="EUR")
    preferred_airports: Mapped[dict | None] = mapped_column(JSON)  # e.g. ["DXB", "SHJ"]
    notification_preferences: Mapped[dict | None] = mapped_column(JSON)

    def __repr__(self) -> str:
        return f"<User {self.email}>"
