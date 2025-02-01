from typing import Optional

from models.user import User
from sqlalchemy.orm import Session
from utils.security import verify_password

from .base import BaseCRUDRepository


class UserCRUDRepository(BaseCRUDRepository):
    def get_user_by_username(self, db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def create_user(self, db: Session, user_data: User) -> User:
        db.add(user_data)
        db.commit()
        db.refresh(user_data)
        return user_data

    def authenticate_user(
        self, db: Session, username: str, password: str
    ) -> Optional[User]:
        user = self.get_user_by_username(db, username)
        if not user:
            return None
        if not verify_password(password, str(user.hashed_password)):
            return None
        return user


user_crud = UserCRUDRepository(model=User)
