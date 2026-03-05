"""FastAPI dependency injection for auth and database."""

from typing import Optional

import jwt
from fastapi import Depends, HTTPException, Cookie, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.security import decode_access_token
from app.models.user import User


async def get_current_user(
    access_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Extract the current user from the JWT cookie. Returns None if not authenticated."""
    if not access_token:
        return None
    try:
        payload = decode_access_token(access_token)
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        return None

    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def require_auth(
    user: Optional[User] = Depends(get_current_user),
) -> User:
    """Dependency that REQUIRES authentication. Raises 401 if not logged in."""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user
