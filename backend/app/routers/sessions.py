from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.session import CreateSessionRequest, SessionResponse, UpdateSessionRequest
from app.services import session_service

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post(
    "",
    response_model=APIResponse[SessionResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_session(
    body: CreateSessionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = await session_service.create_session(
        db, current_user.id, body.date, body.duration_minutes
    )
    return APIResponse(data=SessionResponse.model_validate(session))


@router.patch("/{session_id}", response_model=APIResponse[SessionResponse])
async def update_session(
    session_id: UUID,
    body: UpdateSessionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = await session_service.update_session(
        db,
        current_user.id,
        session_id,
        focus_level=body.focus_level,
        distraction=body.distraction,
    )
    return APIResponse(data=SessionResponse.model_validate(session))


@router.delete("/{session_id}")
async def delete_session(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await session_service.delete_session(db, current_user.id, session_id)
    return {"message": "success"}
