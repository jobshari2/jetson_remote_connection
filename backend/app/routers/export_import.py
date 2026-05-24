import shutil
import tempfile
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.core.config import settings

router = APIRouter(prefix="/api/projects", tags=["export-import"])


@router.get("/{project_id}/export")
async def export_project(project_id: str):
    project_dir = settings.projects_path / project_id
    if not project_dir.exists():
        raise HTTPException(status_code=404, detail="Project not found")

    export_dir = settings.outputs_path / "exports"
    export_dir.mkdir(parents=True, exist_ok=True)

    archive_path = export_dir / f"{project_id}.zip"
    shutil.make_archive(str(archive_path.with_suffix("")), "zip", project_dir)

    return FileResponse(
        archive_path,
        filename=f"{project_id}.zip",
        media_type="application/zip",
    )


@router.post("/import")
async def import_project():
    import zipfile
    from fastapi import UploadFile, File
    from uuid import uuid4

    file = None
    # This will be a multipart upload
    raise HTTPException(status_code=501, detail="Use POST /api/projects/import-zip with multipart")

@router.post("/import-zip")
async def import_project_zip(file: UploadFile = File(...)):
    import zipfile
    from uuid import uuid4

    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files supported")

    new_id = uuid4().hex[:12]
    project_dir = settings.projects_path / new_id
    project_dir.mkdir(parents=True, exist_ok=True)

    content = await file.read()
    zip_path = project_dir / "import.zip"
    zip_path.write_bytes(content)

    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(project_dir)

    zip_path.unlink()

    meta_file = project_dir / ".meta.json"
    if not meta_file.exists():
        meta = {
            "name": file.filename.replace(".zip", ""),
            "description": "Imported project",
            "runtime": "pytorch",
            "created_at": "2024-01-01T00:00:00",
        }
        (project_dir / ".meta.json").write_text(json.dumps(meta, indent=2))

    return {"id": new_id, "message": "Project imported successfully"}
