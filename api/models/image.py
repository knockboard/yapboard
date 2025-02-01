from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base import TimeStampMixin


class Image(TimeStampMixin):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="images")

    def __repr__(self):
        return f"<Image(name={self.name}, user_id={self.user_id})>"
