import shutil
import json
from pathlib import Path
from datetime import datetime
from uuid import uuid4
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.core.config import settings
from app.models.project import ProjectCreate, ProjectInfo, ProjectFile

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _get_project_dir(project_id: str) -> Path:
    return settings.projects_path / project_id


def _read_meta(project_dir: Path) -> Optional[dict]:
    meta_file = project_dir / ".meta.json"
    if meta_file.exists():
        return json.loads(meta_file.read_text())
    return None


def _write_meta(project_dir: Path, meta: dict):
    (project_dir / ".meta.json").write_text(json.dumps(meta, indent=2, default=str))


@router.get("")
async def list_projects():
    projects = []
    if not settings.projects_path.exists():
        return projects

    for p in settings.projects_path.iterdir():
        if p.is_dir():
            meta = _read_meta(p) or {"name": p.name, "description": "", "runtime": "pytorch",
                                       "created_at": datetime.fromtimestamp(p.stat().st_ctime).isoformat()}
            file_count = sum(1 for f in p.rglob("*") if f.is_file() and f.name != ".meta.json")
            size_bytes = sum(f.stat().st_size for f in p.rglob("*") if f.is_file())
            projects.append(ProjectInfo(
                id=p.name,
                name=meta["name"],
                description=meta.get("description", ""),
                runtime=meta.get("runtime", "pytorch"),
                created_at=datetime.fromisoformat(meta["created_at"]) if isinstance(meta["created_at"], str) else meta["created_at"],
                updated_at=datetime.fromtimestamp(p.stat().st_mtime),
                file_count=file_count,
                size_bytes=size_bytes,
            ))

    projects.sort(key=lambda p: p.updated_at, reverse=True)
    return projects


@router.post("", status_code=201)
async def create_project(data: ProjectCreate):
    project_id = uuid4().hex[:12]
    project_dir = _get_project_dir(project_id)
    project_dir.mkdir(parents=True, exist_ok=True)

    meta = {
        "name": data.name,
        "description": data.description,
        "runtime": data.runtime,
        "created_at": datetime.now().isoformat(),
    }
    _write_meta(project_dir, meta)

    return ProjectInfo(
        id=project_id,
        name=data.name,
        description=data.description,
        runtime=data.runtime,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )


@router.get("/{project_id}")
async def get_project(project_id: str):
    project_dir = _get_project_dir(project_id)
    if not project_dir.exists():
        raise HTTPException(status_code=404, detail="Project not found")

    meta = _read_meta(project_dir)
    if not meta:
        raise HTTPException(status_code=404, detail="Project metadata not found")

    return ProjectInfo(
        id=project_id,
        name=meta["name"],
        description=meta.get("description", ""),
        runtime=meta.get("runtime", "pytorch"),
        created_at=meta["created_at"],
        updated_at=datetime.fromtimestamp(project_dir.stat().st_mtime),
    )


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    project_dir = _get_project_dir(project_id)
    if not project_dir.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    shutil.rmtree(project_dir)
    return {"message": "Project deleted"}


@router.post("/{project_id}/duplicate")
async def duplicate_project(project_id: str):
    src_dir = _get_project_dir(project_id)
    if not src_dir.exists():
        raise HTTPException(status_code=404, detail="Source project not found")

    new_id = uuid4().hex[:12]
    dst_dir = _get_project_dir(new_id)
    shutil.copytree(src_dir, dst_dir)

    meta = _read_meta(dst_dir)
    if meta:
        meta["name"] = f"{meta['name']} (Copy)"
        _write_meta(dst_dir, meta)

    return {"id": new_id, "message": "Project duplicated"}


@router.post("/{project_id}/upload")
async def upload_files(project_id: str, files: list[UploadFile] = File(...)):
    project_dir = _get_project_dir(project_id)
    if not project_dir.exists():
        raise HTTPException(status_code=404, detail="Project not found")

    uploaded = []
    for file in files:
        file_path = project_dir / file.filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        content = await file.read()
        file_path.write_bytes(content)
        uploaded.append(file.filename)

    return {"message": f"Uploaded {len(uploaded)} files", "files": uploaded}


@router.get("/{project_id}/files")
async def list_files(project_id: str, path: str = ""):
    project_dir = _get_project_dir(project_id)
    if not project_dir.exists():
        raise HTTPException(status_code=404, detail="Project not found")

    base = project_dir / path if path else project_dir
    if not base.exists() or not base.is_dir():
        raise HTTPException(status_code=404, detail="Path not found")

    files = []
    for item in sorted(base.iterdir()):
        if item.name.startswith("."):
            continue
        files.append(ProjectFile(
            name=item.name,
            path=str(item.relative_to(project_dir)),
            size_bytes=item.stat().st_size if item.is_file() else 0,
            is_dir=item.is_dir(),
            modified_at=datetime.fromtimestamp(item.stat().st_mtime),
        ))

    return files


@router.get("/{project_id}/file")
async def read_file(project_id: str, path: str):
    project_dir = _get_project_dir(project_id)
    file_path = project_dir / path
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    return {"content": file_path.read_text(), "path": path}


@router.put("/{project_id}/file")
async def write_file(project_id: str, path: str, content: str = Form(...)):
    project_dir = _get_project_dir(project_id)
    file_path = project_dir / path
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text(content)
    return {"message": "File saved", "path": path}


@router.delete("/{project_id}/file")
async def delete_file(project_id: str, path: str):
    project_dir = _get_project_dir(project_id)
    file_path = project_dir / path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    if file_path.is_dir():
        shutil.rmtree(file_path)
    else:
        file_path.unlink()

    return {"message": "File deleted"}
