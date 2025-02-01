from typing import Tuple

from config import ENV
from crud import user_crud
from database.database import get_db
from fastapi import Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from models.user import User
from pydantic import ValidationError
from schemas.auth import TokenPayload
from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_pagination_params(
    skip: int = Query(0, ge=0), limit: int = Query(10, gt=0)
) -> Tuple[int, int]:
    return skip, limit


def get_token(token: str = Depends(oauth2_scheme)) -> TokenPayload:
    try:
        payload = jwt.decode(token, ENV.SECRET_KEY, algorithms=["HS256"])
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    return token_data


def get_current_user(
    db: Session = Depends(get_db), token: TokenPayload = Depends(get_token)
) -> User:
    user = user_crud.get_user_by_username(db, token.sub)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    return user
