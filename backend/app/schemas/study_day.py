import datetime
import uuid

from pydantic import BaseModel

from app.schemas.session import SessionResponse


class StudyDayListItem(BaseModel):
    id: uuid.UUID
    date: datetime.date
    is_finished: bool
    total_study_minutes: int
    total_rest_minutes: int
    avg_focus_ceil: int
    has_ai_result: bool
    ai_summary: str | None
    ai_feedback: str | None
    created_at: datetime.datetime
    updated_at: datetime.datetime


class StudyDayDetail(BaseModel):
    id: uuid.UUID | None
    date: datetime.date
    is_finished: bool
    total_study_minutes: int
    total_rest_minutes: int
    avg_focus_ceil: int
    has_ai_result: bool
    ai_summary: str | None
    ai_feedback: str | None
    sessions: list[SessionResponse]


class FinishResponse(BaseModel):
    id: uuid.UUID
    date: datetime.date
    is_finished: bool
    total_study_minutes: int
    total_rest_minutes: int
    avg_focus_ceil: int
    ai_summary: str | None
    ai_feedback: str | None
    has_ai_result: bool


class RegenerateResponse(BaseModel):
    ai_summary: str | None
    ai_feedback: str | None
    has_ai_result: bool
