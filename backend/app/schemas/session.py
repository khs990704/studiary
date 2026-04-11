import datetime
import uuid

from pydantic import BaseModel, field_validator


class CreateSessionRequest(BaseModel):
    date: datetime.date
    duration_minutes: int

    @field_validator("duration_minutes")
    @classmethod
    def duration_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("duration_minutes는 0보다 커야 합니다")
        return v


class UpdateSessionRequest(BaseModel):
    focus_level: int | None = None
    distraction: str | None = None

    @field_validator("focus_level")
    @classmethod
    def focus_range(cls, v: int | None) -> int | None:
        if v is not None and (v < 1 or v > 5):
            raise ValueError("focus_level은 1~5 사이여야 합니다")
        return v

    @field_validator("distraction")
    @classmethod
    def distraction_length(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 100:
            raise ValueError("distraction은 100자 이하여야 합니다")
        return v


class SessionResponse(BaseModel):
    id: uuid.UUID
    study_day_id: uuid.UUID
    order_num: int
    type: str
    duration_minutes: int
    focus_level: int | None
    distraction: str | None
    status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}
