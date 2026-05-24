import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_create_project(client: AsyncClient):
    resp = await client.post("/api/projects", json={
        "name": "Test Project",
        "description": "A test project",
        "runtime": "pytorch",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Test Project"
    assert data["runtime"] == "pytorch"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_projects(client: AsyncClient):
    resp = await client.get("/api/projects")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_gpu_status(client: AsyncClient):
    resp = await client.get("/api/gpu/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "available" in data


@pytest.mark.asyncio
async def test_gpu_metrics(client: AsyncClient):
    resp = await client.get("/api/gpu/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert "available" in data


@pytest.mark.asyncio
async def test_create_and_get_project(client: AsyncClient):
    create_resp = await client.post("/api/projects", json={
        "name": "Get Test",
        "description": "",
        "runtime": "tensorflow",
    })
    assert create_resp.status_code == 201
    project_id = create_resp.json()["id"]

    get_resp = await client.get(f"/api/projects/{project_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Get Test"


@pytest.mark.asyncio
async def test_delete_project(client: AsyncClient):
    create_resp = await client.post("/api/projects", json={
        "name": "Delete Test",
        "description": "",
        "runtime": "pytorch",
    })
    project_id = create_resp.json()["id"]

    del_resp = await client.delete(f"/api/projects/{project_id}")
    assert del_resp.status_code == 200

    get_resp = await client.get(f"/api/projects/{project_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_duplicate_project(client: AsyncClient):
    create_resp = await client.post("/api/projects", json={
        "name": "Original",
        "description": "",
        "runtime": "pytorch",
    })
    project_id = create_resp.json()["id"]

    dup_resp = await client.post(f"/api/projects/{project_id}/duplicate")
    assert dup_resp.status_code == 200
    assert "id" in dup_resp.json()
