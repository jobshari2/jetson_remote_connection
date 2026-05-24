import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from app.services.executor import execution_service
from app.core.config import settings

router = APIRouter(prefix="/api/execution", tags=["execution"])


@router.websocket("/ws/{project_id}")
async def execution_websocket(websocket: WebSocket, project_id: str):
    await websocket.accept()

    try:
        data = await websocket.receive_text()
        payload = json.loads(data)

        action = payload.get("action", "run")
        code = payload.get("code", "")
        file_path = payload.get("file_path", "main.py")
        runtime = payload.get("runtime", settings.default_runtime)

        if action == "stop":
            execution_service.stop_execution(project_id)
            await websocket.send_json({"type": "status", "message": "Execution stopped"})
            return

        await websocket.send_json({"type": "status", "message": f"Starting execution on {runtime}"})

        if code:
            generator = execution_service.execute_code(project_id, code, runtime, file_path)
        else:
            generator = execution_service.execute_file(project_id, file_path, runtime)

        async for line in generator:
            await websocket.send_json({"type": "stdout", "data": line})

        await websocket.send_json({"type": "status", "message": "Execution completed"})

    except WebSocketDisconnect:
        execution_service.stop_execution(project_id)
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except WebSocketDisconnect:
            pass


@router.post("/stop/{project_id}")
async def stop_execution(project_id: str):
    execution_service.stop_execution(project_id)
    return {"message": "Execution stopped"}


@router.post("/run")
async def run_code(project_id: str, code: str, runtime: str = settings.default_runtime, file_path: str = "main.py"):
    outputs = []
    async for line in execution_service.execute_code(project_id, code, runtime, file_path):
        outputs.append(line)

    return {"output": "".join(outputs)}
