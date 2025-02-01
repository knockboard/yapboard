from config import ENV
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = (
    f"postgresql+psycopg2://{ENV.POSTGRES_USER}:{ENV.POSTGRES_PASSWORD}"
    f"@{ENV.POSTGRES_HOST}:{ENV.POSTGRES_PORT}/{ENV.POSTGRES_DB}"
)


engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
