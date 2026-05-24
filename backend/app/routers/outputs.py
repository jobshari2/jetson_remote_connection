from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.core.config import settings

router = APIRouter(prefix="/api/outputs", tags=["outputs"])


@router.get("/{project_id}")
async def list_outputs(project_id: str):
    outputs_dir = settings.outputs_path / project_id
    if not outputs_dir.exists():
        return []

    items = []
    for item in outputs_dir.iterdir():
        if item.is_file():
            items.append({
                "name": item.name,
                "size_bytes": item.stat().st_size,
                "modified_at": item.stat().st_mtime,
            })
    return items


@router.get("/{project_id}/download/{filename}")
async def download_output(project_id: str, filename: str):
    file_path = settings.outputs_path / project_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, filename=filename)


@router.get("/{project_id}/download-all")
async def download_all_outputs(project_id: str):
    import shutil
    import tempfile

    outputs_dir = settings.outputs_path / project_id
    if not outputs_dir.exists():
        raise HTTPException(status_code=404, detail="No outputs found")

    zip_path = settings.outputs_path / f"{project_id}.zip"
    shutil.make_archive(str(zip_path.with_suffix("")), "zip", outputs_dir)

    return FileResponse(zip_path, filename=f"{project_id}.zip", media_type="application/zip")
