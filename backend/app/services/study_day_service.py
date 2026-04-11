import datetime
import math
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.session import Session as SessionModel
from app.models.study_day import StudyDay
from app.services.ai_service import generate_ai_result


def calculate_stats(sessions: list[SessionModel]) -> dict:
    total_study = sum(s.duration_minutes for s in sessions if s.type == "study")
    total_rest = sum(s.duration_minutes for s in sessions if s.type == "rest")
    focus_values = [
        s.focus_level for s in sessions if s.type == "study" and s.focus_level is not None
    ]
    avg_focus = math.ceil(sum(focus_values) / len(focus_values)) if focus_values else 0
    return {
        "total_study_minutes": total_study,
        "total_rest_minutes": total_rest,
        "avg_focus_ceil": avg_focus,
    }


async def get_study_days(
    db: AsyncSession, user_id: uuid.UUID, year: int, month: int
) -> list[dict]:
    start_date = datetime.date(year, month, 1)
    if month == 12:
        end_date = datetime.date(year + 1, 1, 1)
    else:
        end_date = datetime.date(year, month + 1, 1)

    result = await db.execute(
        select(StudyDay)
        .where(
            StudyDay.user_id == user_id,
            StudyDay.date >= start_date,
            StudyDay.date < end_date,
        )
        .options(selectinload(StudyDay.sessions), selectinload(StudyDay.ai_result))
        .order_by(StudyDay.date.desc())
    )
    study_days = result.scalars().all()

    items = []
    for sd in study_days:
        stats = calculate_stats(list(sd.sessions))
        items.append({
            "id": sd.id,
            "date": sd.date,
            "is_finished": sd.is_finished,
            "total_study_minutes": stats["total_study_minutes"],
            "total_rest_minutes": stats["total_rest_minutes"],
            "avg_focus_ceil": stats["avg_focus_ceil"],
            "has_ai_result": sd.ai_result is not None,
            "ai_summary": sd.ai_result.summary if sd.ai_result else None,
            "ai_feedback": sd.ai_result.feedback if sd.ai_result else None,
            "created_at": sd.created_at,
            "updated_at": sd.updated_at,
        })
    return items


async def get_study_day_detail(
    db: AsyncSession, user_id: uuid.UUID, date: datetime.date
) -> dict:
    result = await db.execute(
        select(StudyDay)
        .where(StudyDay.user_id == user_id, StudyDay.date == date)
        .options(selectinload(StudyDay.sessions), selectinload(StudyDay.ai_result))
    )
    study_day = result.scalar_one_or_none()

    if study_day is None:
        return {
            "id": None,
            "date": date,
            "is_finished": False,
            "total_study_minutes": 0,
            "total_rest_minutes": 0,
            "avg_focus_ceil": 0,
            "has_ai_result": False,
            "ai_summary": None,
            "ai_feedback": None,
            "sessions": [],
        }

    stats = calculate_stats(list(study_day.sessions))
    sessions_sorted = sorted(study_day.sessions, key=lambda s: s.order_num)

    return {
        "id": study_day.id,
        "date": study_day.date,
        "is_finished": study_day.is_finished,
        "total_study_minutes": stats["total_study_minutes"],
        "total_rest_minutes": stats["total_rest_minutes"],
        "avg_focus_ceil": stats["avg_focus_ceil"],
        "has_ai_result": study_day.ai_result is not None,
        "ai_summary": study_day.ai_result.summary if study_day.ai_result else None,
        "ai_feedback": study_day.ai_result.feedback if study_day.ai_result else None,
        "sessions": sessions_sorted,
    }


async def finish_study_day(
    db: AsyncSession, user_id: uuid.UUID, date: datetime.date
) -> dict:
    today = datetime.date.today()
    if date != today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="오늘 날짜의 학습만 종료할 수 있습니다",
        )

    result = await db.execute(
        select(StudyDay)
        .where(StudyDay.user_id == user_id, StudyDay.date == date)
        .options(selectinload(StudyDay.sessions), selectinload(StudyDay.ai_result))
    )
    study_day = result.scalar_one_or_none()

    if study_day is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="학습일을 찾을 수 없습니다",
        )

    if not study_day.sessions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="세션이 없습니다",
        )

    if study_day.is_finished:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 종료된 학습일입니다",
        )

    # AI 생성 먼저 시도 - 실패 시 is_finished를 변경하지 않음
    ai_summary = None
    ai_feedback = None
    ai_result = None
    try:
        ai_result = await generate_ai_result(study_day.id, list(study_day.sessions))
        if ai_result is not None:
            ai_summary = ai_result.summary
            ai_feedback = ai_result.feedback
    except Exception:
        pass

    if not ai_summary or not ai_feedback:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI 생성에 실패했습니다. 다시 시도해주세요.",
        )

    study_day.is_finished = True
    db.add(ai_result)
    await db.commit()

    stats = calculate_stats(list(study_day.sessions))
    return {
        "id": study_day.id,
        "date": study_day.date,
        "is_finished": study_day.is_finished,
        "total_study_minutes": stats["total_study_minutes"],
        "total_rest_minutes": stats["total_rest_minutes"],
        "avg_focus_ceil": stats["avg_focus_ceil"],
        "ai_summary": ai_summary,
        "ai_feedback": ai_feedback,
        "has_ai_result": ai_summary is not None,
    }
