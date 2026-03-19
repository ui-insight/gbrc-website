"""Application settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration."""

    app_name: str = "GBRC API"
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Dashboard access token (empty = no auth required, for dev)
    dashboard_token: str = ""
    dashboard_data_dir: str = ""

    # Future: database, iLabs integration, etc.
    # database_url: str = ""
    # ilabs_api_key: str = ""

    model_config = {"env_prefix": "GBRC_", "env_file": ".env"}


settings = Settings()
