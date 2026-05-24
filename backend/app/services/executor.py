import asyncio
import json
import docker
from pathlib import Path
from typing import AsyncGenerator
from app.core.config import settings


RUNTIME_IMAGES = {
    "pytorch": "ai-gpu-workbench-pytorch",
    "tensorflow": "ai-gpu-workbench-tensorflow",
    "cnn": "ai-gpu-workbench-cnn",
    "cuda": "ai-gpu-workbench-cuda-generic",
    "jupyter": "ai-gpu-workbench-jupyter",
}


class ExecutionService:
    def __init__(self):
        self.client = docker.from_env()
        self._containers: dict[str, str] = {}

    async def execute_code(
        self,
        project_id: str,
        code: str,
        runtime: str = "pytorch",
        filename: str = "main.py",
    ) -> AsyncGenerator[str, None]:
        image = RUNTIME_IMAGES.get(runtime, RUNTIME_IMAGES["pytorch"])
        project_dir = settings.projects_path / project_id
        outputs_dir = settings.outputs_path / project_id
        outputs_dir.mkdir(parents=True, exist_ok=True)

        script_path = project_dir / filename
        script_path.parent.mkdir(parents=True, exist_ok=True)
        script_path.write_text(code)

        cmd = ["python3", f"/workspace/projects/{project_id}/{filename}"]

        try:
            container = self.client.containers.run(
                image=image,
                command=cmd,
                volumes={
                    str(settings.workspace_path): {"bind": "/workspace", "mode": "rw"},
                },
                runtime="nvidia" if settings.gpu_enabled else None,
                environment=[
                    f"CUDA_VISIBLE_DEVICES={0}",
                    "PYTHONUNBUFFERED=1",
                ],
                working_dir="/workspace",
                detach=True,
                network_disabled=False,
                mem_limit="7g",
                nano_cpus=8000000000,
            )

            self._containers[project_id] = container.id

            for line in container.logs(stream=True, follow=True):
                yield line.decode("utf-8", errors="replace")
                await asyncio.sleep(0)

            result = container.wait()
            exit_code = result.get("StatusCode", -1)

            yield f"\n[EXIT CODE: {exit_code}]\n"

            container.remove()

        except docker.errors.ImageNotFound:
            yield f"Error: Docker image '{image}' not found. Build it first with: docker compose build\n"
        except docker.errors.APIError as e:
            yield f"Docker error: {str(e)}\n"
        except Exception as e:
            yield f"Error: {str(e)}\n"
        finally:
            self._containers.pop(project_id, None)

    async def execute_file(
        self,
        project_id: str,
        file_path: str,
        runtime: str = "pytorch",
    ) -> AsyncGenerator[str, None]:
        project_dir = settings.projects_path / project_id
        full_path = project_dir / file_path
        if not full_path.exists():
            yield f"Error: File '{file_path}' not found\n"
            return

        code = full_path.read_text()
        async for line in self.execute_code(project_id, code, runtime, file_path):
            yield line

    def stop_execution(self, project_id: str):
        container_id = self._containers.get(project_id)
        if container_id:
            try:
                container = self.client.containers.get(container_id)
                container.stop(timeout=5)
                container.remove()
            except docker.errors.NotFound:
                pass
            self._containers.pop(project_id, None)


execution_service = ExecutionService()
