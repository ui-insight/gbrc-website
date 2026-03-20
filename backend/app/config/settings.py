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

    # Database
    database_url: str = "postgresql+asyncpg://gbrc:gbrc@localhost:5432/gbrc"

    # File uploads
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 50

    # MindRouter AI
    mindrouter_base_url: str = "https://mindrouter.uidaho.edu"
    mindrouter_api_key: str = ""
    mindrouter_model: str = "openai/gpt-oss-120b"
    mindrouter_ocr_model: str = "dots.OCR"

    model_config = {"env_prefix": "GBRC_", "env_file": ".env"}


settings = Settings()
