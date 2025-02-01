from datetime import timedelta

from config import ENV
from crud import user_crud
from database.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models import User
from schemas.auth import AuthResponseSchema, UserRegisterSchema
from sqlalchemy.orm import Session
from utils import security

router = APIRouter(tags=["auth"], prefix="/auth")


@router.post(
    "/register",
    response_model=AuthResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def register(data: UserRegisterSchema, db: Session = Depends(get_db)):
    username_exists = user_crud.get_user_by_username(db, data.username)
    if username_exists is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username already exists.",
        )

    email_exists = user_crud.get_user_by_email(db, data.email)
    if email_exists is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email already exists.",
        )

    user_data = User(
        username=data.username,
        email=data.email,
        hashed_password=security.get_password_hash(data.password),
    )
    new_user = user_crud.create_user(db, user_data=user_data)

    access_token_expires = timedelta(minutes=ENV.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject={"id": new_user.id, "username": new_user.username},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": new_user.username,
    }


@router.post(
    "/login",
    response_model=AuthResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def register(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    user = user_crud.authenticate_user(
        db, username=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password",
        )

    access_token_expires = timedelta(minutes=ENV.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject={"id": user.id, "username": user.username},
        expires_delta=access_token_expires,
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
    }
