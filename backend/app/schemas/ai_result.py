import datetime
import uuid

from pydantic import BaseModel


class AIResultResponse(BaseModel):
    id: uuid.UUID
    study_day_id: uuid.UUID
    summary: str | None
    feedback: str | None
    model_used: str | None
    created_at: datetime.datetime

    model_config = {"from_attributes": True}
