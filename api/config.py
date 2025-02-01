from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    POSTGRES_HOST: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_DB: str = "yapboard"
    POSTGRES_PASSWORD: str = "chad"
    POSTGRES_PORT: str = "5432"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 100
    SECRET_KEY: str = "dc601fa393c8c0e07f65b49a58cabb9b"


ENV = Environment()
