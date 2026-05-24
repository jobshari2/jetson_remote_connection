import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.gpu import detect_gpu
from app.routers import projects, gpu, execution, templates, datasets, outputs, models_router, export_import


logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI GPU Workbench")
    gpu_available = detect_gpu()
    if gpu_available:
        logger.info("GPU detected - acceleration enabled")
    else:
        logger.warning("No GPU detected - running in CPU fallback mode")

    for path in [settings.projects_path, settings.outputs_path, settings.datasets_path,
                 settings.models_path, settings.logs_path, settings.templates_path]:
        path.mkdir(parents=True, exist_ok=True)

    yield

    logger.info("Shutting down AI GPU Workbench")


app = FastAPI(
    title="AI GPU Workbench",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(gpu.router)
app.include_router(execution.router)
app.include_router(templates.router)
app.include_router(datasets.router)
app.include_router(outputs.router)
app.include_router(models_router.router)
app.include_router(export_import.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "gpu": detect_gpu()}
