import json
from pathlib import Path
from datetime import datetime
from uuid import uuid4
from fastapi import APIRouter, HTTPException
from app.core.config import settings
from app.models.project import ProjectTemplate

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("")
async def list_templates():
    templates = []
    templates_dir = settings.templates_path
    if not templates_dir.exists():
        return templates

    for t in templates_dir.iterdir():
        if t.is_dir():
            meta_file = t / ".meta.json"
            if meta_file.exists():
                meta = json.loads(meta_file.read_text())
                templates.append(ProjectTemplate(
                    id=t.name,
                    name=meta.get("name", t.name),
                    description=meta.get("description", ""),
                    runtime=meta.get("runtime", "pytorch"),
                    created_at=datetime.fromisoformat(meta["created_at"]) if isinstance(meta["created_at"], str) else datetime.now(),
                ))

    return templates


@router.post("", status_code=201)
async def create_template(name: str, description: str = "", runtime: str = "pytorch"):
    template_id = uuid4().hex[:12]
    template_dir = settings.templates_path / template_id
    template_dir.mkdir(parents=True, exist_ok=True)

    meta = {
        "name": name,
        "description": description,
        "runtime": runtime,
        "created_at": datetime.now().isoformat(),
    }
    (template_dir / ".meta.json").write_text(json.dumps(meta, indent=2))

    return ProjectTemplate(
        id=template_id,
        name=name,
        description=description,
        runtime=runtime,
        created_at=datetime.now(),
    )


@router.post("/{template_id}/apply/{project_id}")
async def apply_template(template_id: str, project_id: str):
    import shutil
    template_dir = settings.templates_path / template_id
    project_dir = settings.projects_path / project_id

    if not template_dir.exists():
        raise HTTPException(status_code=404, detail="Template not found")
    if not project_dir.exists():
        raise HTTPException(status_code=404, detail="Project not found")

    for item in template_dir.iterdir():
        if item.name.startswith("."):
            continue
        if item.is_dir():
            shutil.copytree(item, project_dir / item.name, dirs_exist_ok=True)
        else:
            shutil.copy2(item, project_dir / item.name)

    return {"message": "Template applied"}
