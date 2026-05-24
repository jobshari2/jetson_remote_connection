from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.core.config import settings

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("/{project_id}")
async def list_models(project_id: str):
    models_dir = settings.models_path / project_id
    if not models_dir.exists():
        return []

    items = []
    for item in models_dir.iterdir():
        if item.is_file():
            items.append({
                "name": item.name,
                "size_bytes": item.stat().st_size,
                "modified_at": item.stat().st_mtime,
            })
    return items


@router.get("/{project_id}/download/{filename}")
async def download_model(project_id: str, filename: str):
    file_path = settings.models_path / project_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Model not found")
    return FileResponse(file_path, filename=filename)
