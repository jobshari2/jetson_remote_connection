import subprocess
import json
import re
from typing import Optional
from app.core.config import settings


class GPUInfo:
    name: str
    memory_total_mb: int
    memory_used_mb: int
    memory_free_mb: int
    utilization_percent: float
    temperature_c: Optional[float]
    power_w: Optional[float]


def detect_gpu() -> bool:
    if not settings.gpu_enabled:
        return False
    try:
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=name", "--format=csv,noheader"],
            capture_output=True, text=True, timeout=5
        )
        return result.returncode == 0 and bool(result.stdout.strip())
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def get_gpu_metrics() -> list[GPUInfo]:
    try:
        result = subprocess.run(
            [
                "nvidia-smi",
                "--query-gpu=name,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu,power.draw",
                "--format=csv,noheader,nounits",
            ],
            capture_output=True, text=True, timeout=5,
        )
        if result.returncode != 0:
            return []

        gpus = []
        for line in result.stdout.strip().split("\n"):
            if not line.strip():
                continue
            parts = [p.strip() for p in line.split(",")]
            if len(parts) >= 5:
                info = GPUInfo()
                info.name = parts[0]
                info.memory_total_mb = int(parts[1]) if parts[1] else 0
                info.memory_used_mb = int(parts[2]) if parts[2] else 0
                info.memory_free_mb = int(parts[3]) if parts[3] else 0
                info.utilization_percent = float(parts[4]) if parts[4] else 0.0
                info.temperature_c = float(parts[5]) if len(parts) > 5 and parts[5] else None
                info.power_w = float(parts[6]) if len(parts) > 6 and parts[6] else None
                gpus.append(info)

        return gpus
    except (FileNotFoundError, subprocess.TimeoutExpired, ValueError):
        return []


def get_gpu_summary() -> dict:
    gpus = get_gpu_metrics()
    if not gpus:
        return {"available": False, "gpus": []}

    return {
        "available": True,
        "gpus": [
            {
                "name": g.name,
                "memory_total_mb": g.memory_total_mb,
                "memory_used_mb": g.memory_used_mb,
                "memory_free_mb": g.memory_free_mb,
                "utilization_percent": g.utilization_percent,
                "temperature_c": g.temperature_c,
                "power_w": g.power_w,
            }
            for g in gpus
        ],
    }
