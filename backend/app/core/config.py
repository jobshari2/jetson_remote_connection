from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    workspace_dir: str = "./workspace"
    log_level: str = "INFO"
    host: str = "0.0.0.0"
    port: int = 8000
    max_upload_size_mb: int = 500
    gpu_enabled: bool = True
    default_runtime: str = "pytorch"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def workspace_path(self) -> Path:
        return Path(self.workspace_dir).resolve()

    @property
    def projects_path(self) -> Path:
        return self.workspace_path / "projects"

    @property
    def outputs_path(self) -> Path:
        return self.workspace_path / "outputs"

    @property
    def datasets_path(self) -> Path:
        return self.workspace_path / "datasets"

    @property
    def models_path(self) -> Path:
        return self.workspace_path / "models"

    @property
    def logs_path(self) -> Path:
        return self.workspace_path / "logs"

    @property
    def templates_path(self) -> Path:
        return self.workspace_path / "templates"

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


settings = Settings()
