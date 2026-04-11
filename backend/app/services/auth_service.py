import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.utils.security import hash_password, verify_password


async def register(
    db: AsyncSession, email: str, password: str, nickname: str
) -> User:
    user = User(
        email=email,
        password_hash=hash_password(password),
        nickname=nickname,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate(
    db: AsyncSession, email: str, password: str
) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def check_email_exists(db: AsyncSession, email: str) -> bool:
    result = await db.execute(select(User.id).where(User.email == email))
    return result.scalar_one_or_none() is not None
