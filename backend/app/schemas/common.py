from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    data: T
    message: str = "success"


class ErrorResponse(BaseModel):
    detail: str
    code: str
