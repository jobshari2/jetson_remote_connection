from fastapi import APIRouter
from app.core.gpu import detect_gpu, get_gpu_summary, get_gpu_metrics, GPUInfo

router = APIRouter(prefix="/api/gpu", tags=["gpu"])


@router.get("/status")
async def gpu_status():
    available = detect_gpu()
    return {"available": available, "enabled": True}


@router.get("/metrics")
async def gpu_metrics():
    return get_gpu_summary()


@router.get("/detect")
async def gpu_detect():
    available = detect_gpu()
    summary = get_gpu_summary() if available else {"available": False, "gpus": []}
    return {"available": available, **summary}
