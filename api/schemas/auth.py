from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserRegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str


class AuthResponseSchema(BaseModel):
    access_token: str
    token_type: str
    username: str


class TokenPayload(BaseModel):
    sub: str
    exp: datetime
