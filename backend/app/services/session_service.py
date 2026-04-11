import datetime
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.session import Session
from app.models.study_day import StudyDay


async def create_session(
    db: AsyncSession,
    user_id: uuid.UUID,
    date: datetime.date,
    duration_minutes: int,
) -> Session:
    today = datetime.date.today()
    if date != today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="오늘 날짜의 세션만 생성할 수 있습니다",
        )

    # Get or create study_day
    result = await db.execute(
        select(StudyDay)
        .where(StudyDay.user_id == user_id, StudyDay.date == date)
        .options(selectinload(StudyDay.sessions))
    )
    study_day = result.scalar_one_or_none()

    if study_day is None:
        study_day = StudyDay(user_id=user_id, date=date)
        db.add(study_day)
        await db.flush()
        # Reload with sessions
        result = await db.execute(
            select(StudyDay)
            .where(StudyDay.id == study_day.id)
            .options(selectinload(StudyDay.sessions))
        )
        study_day = result.scalar_one()

    if study_day.is_finished:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 종료된 학습일입니다",
        )

    # Determine type based on last session
    existing_sessions = sorted(study_day.sessions, key=lambda s: s.order_num)
    if not existing_sessions:
        session_type = "study"
    else:
        last_type = existing_sessions[-1].type
        session_type = "rest" if last_type == "study" else "study"

    order_num = len(existing_sessions) + 1

    session = Session(
        study_day_id=study_day.id,
        order_num=order_num,
        type=session_type,
        duration_minutes=duration_minutes,
        status="running",
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def update_session(
    db: AsyncSession,
    user_id: uuid.UUID,
    session_id: uuid.UUID,
    focus_level: int | None = None,
    distraction: str | None = None,
) -> Session:
    result = await db.execute(
        select(Session)
        .join(StudyDay)
        .where(Session.id == session_id)
        .options(selectinload(Session.study_day))
    )
    session = result.scalar_one_or_none()

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="세션을 찾을 수 없습니다",
        )

    study_day = session.study_day

    if study_day.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="접근 권한이 없습니다",
        )

    if study_day.date != datetime.date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="당일 세션만 수정할 수 있습니다",
        )

    if study_day.is_finished:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 종료된 학습일입니다",
        )

    # rest session cannot have focus_level or distraction
    if session.type == "rest" and (focus_level is not None or distraction is not None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="휴식 세션에는 집중도/방해요소를 설정할 수 없습니다",
        )

    if focus_level is not None:
        session.focus_level = focus_level
    if distraction is not None:
        session.distraction = distraction

    await db.commit()
    await db.refresh(session)
    return session


async def delete_session(
    db: AsyncSession,
    user_id: uuid.UUID,
    session_id: uuid.UUID,
) -> None:
    result = await db.execute(
        select(Session)
        .join(StudyDay)
        .where(Session.id == session_id)
        .options(selectinload(Session.study_day))
    )
    session = result.scalar_one_or_none()

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="세션을 찾을 수 없습니다",
        )

    study_day = session.study_day

    if study_day.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="접근 권한이 없습니다",
        )

    if study_day.date != datetime.date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="당일 세션만 삭제할 수 있습니다",
        )

    if study_day.is_finished:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 종료된 학습일입니다",
        )

    study_day_id = study_day.id
    await db.delete(session)
    await db.flush()

    # Reorder remaining sessions by created_at
    remaining_result = await db.execute(
        select(Session)
        .where(Session.study_day_id == study_day_id)
        .order_by(Session.created_at.asc())
    )
    remaining_sessions = remaining_result.scalars().all()

    for idx, s in enumerate(remaining_sessions, start=1):
        s.order_num = idx

    await db.commit()
