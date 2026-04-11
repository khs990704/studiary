import datetime
import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_current_user, get_db
from app.models.study_day import StudyDay
from app.models.user import User
from app.schemas.common import APIResponse

router = APIRouter(prefix="/heatmap", tags=["heatmap"])


class HeatmapDay:
    def __init__(self, date: datetime.date, avg_focus_ceil: int):
        self.date = date
        self.avg_focus_ceil = avg_focus_ceil


@router.get("")
async def get_heatmap(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start_date = datetime.date(year, month, 1)
    if month == 12:
        end_date = datetime.date(year + 1, 1, 1)
    else:
        end_date = datetime.date(year, month + 1, 1)

    result = await db.execute(
        select(StudyDay)
        .where(
            StudyDay.user_id == current_user.id,
            StudyDay.date >= start_date,
            StudyDay.date < end_date,
        )
        .options(selectinload(StudyDay.sessions))
    )
    study_days = result.scalars().all()

    days = []
    for sd in study_days:
        focus_values = [
            s.focus_level
            for s in sd.sessions
            if s.type == "study" and s.focus_level is not None
        ]
        avg_focus = math.ceil(sum(focus_values) / len(focus_values)) if focus_values else 0
        days.append({"date": sd.date.isoformat(), "avg_focus_ceil": avg_focus})

    return APIResponse(
        data={"year": year, "month": month, "days": days}
    )
