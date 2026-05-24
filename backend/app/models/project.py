from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    runtime: str = "pytorch"


class ProjectInfo(BaseModel):
    id: str
    name: str
    description: str
    runtime: str
    created_at: datetime
    updated_at: datetime
    file_count: int = 0
    size_bytes: int = 0


class ProjectFile(BaseModel):
    name: str
    path: str
    size_bytes: int
    is_dir: bool
    modified_at: datetime


class ProjectTemplate(BaseModel):
    id: str
    name: str
    description: str
    runtime: str
    created_at: datetime
