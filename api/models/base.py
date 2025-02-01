from sqlalchemy import Column, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()
metadata = Base.metadata


class TimeStampMixin(Base):
    __abstract__ = True

    date_created = Column(DateTime, default=func.now())
    date_updated = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"{self.__class__.__name__}#{self.id}"
