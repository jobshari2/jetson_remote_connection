from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.config import settings

router = APIRouter(prefix="/api/datasets", tags=["datasets"])


@router.get("")
async def list_datasets():
    datasets_dir = settings.datasets_path
    if not datasets_dir.exists():
        return []

    items = []
    for item in datasets_dir.iterdir():
        if item.is_file():
            items.append({
                "name": item.name,
                "size_bytes": item.stat().st_size,
                "modified_at": item.stat().st_mtime,
            })
    return items


@router.post("/upload")
async def upload_dataset(files: list[UploadFile] = File(...)):
    datasets_dir = settings.datasets_path
    datasets_dir.mkdir(parents=True, exist_ok=True)

    uploaded = []
    for file in files:
        file_path = datasets_dir / file.filename
        content = await file.read()
        file_path.write_bytes(content)
        uploaded.append(file.filename)

    return {"message": f"Uploaded {len(uploaded)} datasets", "files": uploaded}


@router.delete("/{filename}")
async def delete_dataset(filename: str):
    file_path = settings.datasets_path / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    file_path.unlink()
    return {"message": "Dataset deleted"}
