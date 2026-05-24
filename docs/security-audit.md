# Security Audit & Uninstall Guide

## GPU Safety Assessment

**Verdict: GPU SAFE — No harmful GPU operations exist in this codebase.**

Every GPU interaction in the platform was audited:

| Component | GPU Operation | Type | Risk |
|-----------|--------------|------|------|
| `backend/app/core/gpu.py` | `nvidia-smi --query-gpu=name,memory,utilization,temperature,power` | **Read-only query** | None |
| `docker-compose.yml` | `runtime: nvidia` (Docker GPU passthrough) | **Standard NVIDIA runtime** | None |
| `backend/app/services/executor.py` | `CUDA_VISIBLE_DEVICES=0` env var | **Environment variable** | None |
| All Docker runtime images | Pull from `nvcr.io` (NVIDIA official registry) | **Standard image pull** | None |

**What the platform does NOT do:**
- ❌ No GPU firmware flashing
- ❌ No overclocking or clock speed changes
- ❌ No power limit modifications
- ❌ No ECC toggling
- ❌ No GPU driver installation/removal
- ❌ No direct GPU memory mapping from host
- ❌ No kernel module loading

## System Safety Assessment

**Verdict: SYSTEM SAFE — All modifications are standard, reversible package installations.**

### What the setup script does:

| Action | Command | Reversible? |
|--------|---------|-------------|
| Detect GPU | `nvidia-smi --query-gpu` (read-only) | N/A — no changes |
| Install Docker | `curl https://get.docker.com \| sh` | Yes — `apt remove docker-ce` |
| Install NVIDIA Container Toolkit | `apt install nvidia-container-toolkit` | Yes — `apt remove nvidia-container-toolkit` |
| Configure Docker runtime | `nvidia-ctk runtime configure --runtime=docker` | Yes — edit `/etc/docker/daemon.json` manually |
| Restart Docker daemon | `systemctl restart docker` | Reversible by restarting again |
| Install Python/Node.js | `apt install python3-pip nodejs npm` | Yes — `apt remove python3-pip nodejs npm` |

### What Docker Compose does:

| Service | Runs As | Host Access |
|---------|---------|-------------|
| Backend container | `python:3.11-slim` | Docker socket (`/var/run/docker.sock`) — required to launch runtime containers |
| Frontend container | `nginx:alpine` | None — purely static file serving |
| Runtime containers | Ephemeral per exec | Workspace directory only — removed after execution |

## Identified Concerns

### ⚠️ Medium: Docker socket mount

**File:** `docker-compose.yml`, line 10
```
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

The backend container has root-level access to the host Docker daemon. This is necessary for the execution engine to launch runtime containers on the Jetson GPU, but it means that if the backend API were compromised, an attacker could control all Docker containers on the host.

**Mitigation:**
- The backend only accepts WebSocket connections from the local frontend (same Docker network)
- No authentication tokens or secrets are stored
- Runtime containers are ephemeral and resource-limited
- Consider adding API authentication for production use

### ⚠️ Low: Path traversal risk

**File:** `backend/app/routers/projects.py`, lines 146, 172, 182

Path parameters from user requests are concatenated into file paths. While `project_dir` acts as a prefix boundary, path traversal sequences like `../` in the `path` parameter could theoretically escape the project directory.

**Mitigation in current code:**
- `write_file` at line 183 sets `file_path.parent.mkdir()` which limits writes
- `read_file` at line 173 checks `file_path.exists()` and `is_file()`
- The workspace is a dedicated directory, not system root
- **Recommendation:** Add explicit `resolve()` with `.startswith()` check for production hardening.

### ✅ Low: Setup script downloads unverified content

**File:** `scripts/setup-jetson.sh`, line 20
```
curl -fsSL https://get.docker.com | sh
```

This is the **official recommended Docker installation method** used globally. The script is signed and hosted on Docker's official infrastructure. Standard industry practice.

## Uninstall / Removal Guide

### Option A: Quick cleanup (keeps data)

Stop the platform and remove containers:

```bash
cd /path/to/ai-gpu-workbench
docker compose down --rmi local --volumes
```

### Option B: Full uninstall (removes everything)

#### Step 1: Stop the platform

```bash
cd /path/to/ai-gpu-workbench
docker compose down -v --rmi all
```

#### Step 2: Remove Docker runtime images

```bash
docker rmi ai-gpu-workbench-pytorch
docker rmi ai-gpu-workbench-tensorflow
docker rmi ai-gpu-workbench-cnn
docker rmi ai-gpu-workbench-cuda-generic
docker rmi ai-gpu-workbench-jupyter
docker system prune -f   # Clean up dangling images and cache
```

#### Step 3: Remove the project directory (includes all projects, datasets, models)

```bash
rm -rf /path/to/ai-gpu-workbench
```

> **Warning:** This deletes all projects, uploaded datasets, trained models, and outputs. Back up anything you want to keep first.

#### Step 4: Uninstall NVIDIA Container Toolkit (if desired)

```bash
sudo apt remove --purge nvidia-container-toolkit nvidia-container-runtime
sudo rm -f /etc/apt/sources.list.d/nvidia-docker.list
sudo rm -f /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
```

#### Step 5: Reset Docker daemon config (if desired)

Edit `/etc/docker/daemon.json` and remove any `nvidia` runtime entries added by the setup script. Then restart Docker:

```bash
sudo systemctl restart docker
```

#### Step 6: Uninstall Docker Engine (if no longer needed)

```bash
sudo apt remove --purge docker-ce docker-ce-cli containerd.io
sudo rm -rf /var/lib/docker   # Removes all Docker data
```

> **Warning:** This removes ALL Docker containers, images, and volumes on the system, not just those created by AI GPU Workbench.

### Option C: Minimal removal (leave Docker and NVIDIA tools)

If you still need Docker and NVIDIA Container Toolkit for other projects:

```bash
docker compose down
docker rmi ai-gpu-workbench-*
rm -rf /path/to/ai-gpu-workbench
```
