import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.study_day import (
    FinishResponse,
    RegenerateResponse,
    StudyDayDetail,
    StudyDayListItem,
)
from app.services import study_day_service
from app.services.ai_service import regenerate_ai_result

router = APIRouter(prefix="/study-days", tags=["study-days"])


@router.get("", response_model=APIResponse[list[StudyDayListItem]])
async def list_study_days(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = await study_day_service.get_study_days(db, current_user.id, year, month)
    return APIResponse(data=[StudyDayListItem(**item) for item in items])


@router.get("/{date}", response_model=APIResponse[StudyDayDetail])
async def get_study_day(
    date: datetime.date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    detail = await study_day_service.get_study_day_detail(db, current_user.id, date)
    return APIResponse(data=StudyDayDetail(**detail))


@router.post("/{date}/finish", response_model=APIResponse[FinishResponse])
async def finish_study_day(
    date: datetime.date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await study_day_service.finish_study_day(db, current_user.id, date)
    return APIResponse(data=FinishResponse(**result))


@router.post("/{date}/regenerate-ai", response_model=APIResponse[RegenerateResponse])
async def regenerate_ai(
    date: datetime.date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await regenerate_ai_result(db, current_user.id, date)
    return APIResponse(data=RegenerateResponse(**result))
