import datetime
import re
import uuid

from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    nickname: str

    @field_validator("email")
    @classmethod
    def email_max_length(cls, v: str) -> str:
        if len(v) > 255:
            raise ValueError("이메일은 255자 이하여야 합니다")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("비밀번호는 최소 8자 이상이어야 합니다")
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("비밀번호에 영문이 포함되어야 합니다")
        if not re.search(r"[0-9]", v):
            raise ValueError("비밀번호에 숫자가 포함되어야 합니다")
        return v

    @field_validator("nickname")
    @classmethod
    def nickname_length(cls, v: str) -> str:
        if len(v) < 1 or len(v) > 50:
            raise ValueError("닉네임은 1~50자여야 합니다")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    nickname: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
