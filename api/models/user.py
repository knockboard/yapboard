from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from .base import TimeStampMixin


class User(TimeStampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(30), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=False, nullable=True, default="")
    first_name = Column(String(30), nullable=True, default="")
    last_name = Column(String(30), nullable=True, default="")
    hashed_password = Column(String, nullable=False)

    images = relationship("Image", back_populates="user")

    def __repr__(self):
        return f"<User(username={self.username}, email={self.email})>"
