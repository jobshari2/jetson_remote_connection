# AI GPU Workbench

A lightweight, production-ready local platform for AI/ML development on NVIDIA Jetson Orin (8GB). Replaces Google Colab with a self-hosted, GPU-accelerated development environment you control.

---

## Architecture Overview

The system has two sides: the **Jetson (server)** that runs your GPU workloads, and your **local machine** where you access the web interface.

```
┌──────────────────────────────────────────────────┐
│  YOUR LOCAL MACHINE (browser only)               │
│  ┌──────────────┐                                │
│  │  Chrome/Edge │  http://jetson-ip:3000         │
│  │  Firefox     │──────────────────┐             │
│  └──────────────┘                  │             │
└────────────────────────────────────┼─────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  JETSON ORIN (the GPU server)                                       │
│                                                                     │
│  ┌────────────┐    ┌──────────────┐    ┌─────────────────────────┐ │
│  │  Frontend  │───▶│   Backend    │───▶│  Docker Engine          │ │
│  │  Nginx     │    │   FastAPI    │    │  ┌───────────────────┐  │ │
│  │  (port 80) │◀───│  (port 8000) │    │  │ PyTorch Container │  │ │
│  └────────────┘    └──────────────┘    │  ├───────────────────┤  │ │
│                                         │  │ TensorFlow Cont. │  │ │
│        Workspace (persistent storage)    │  ├───────────────────┤  │ │
│        ┌──────────────────────────┐     │  │ CNN Container     │  │ │
│        │ projects/  outputs/      │     │  ├───────────────────┤  │ │
│        │ datasets/  models/       │     │  │ CUDA Container    │  │ │
│        │ logs/      templates/    │     │  └───────────────────┘  │ │
│        └──────────────────────────┘     └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### What runs where

| Component | Runs On | Purpose |
|-----------|---------|---------|
| **Docker Engine** | Jetson | Launches isolated containers with GPU access |
| **NVIDIA Container Toolkit** | Jetson | Enables GPU passthrough to Docker containers |
| **Runtime Images** (5 types) | Jetson | Pre-built environments for PyTorch, TF, CNN, CUDA, Jupyter |
| **Backend API** (FastAPI) | Jetson | Manages projects, files, execution, GPU metrics |
| **Frontend UI** (React) | Jetson (served via Nginx) | Web-based IDE — Monaco Editor, file browser, terminal |
| **Workspace Storage** | Jetson | Persists all project files, datasets, models, outputs |
| **Web Browser** | Your local machine | Access the UI at `http://<jetson-ip>:3000` |

> **No installation needed on your local machine** — just a browser. Everything runs on the Jetson.

---

## Requirements Checklist

### On the Jetson Orin

These are one-time setup steps to prepare your Jetson to run GPU workloads:

| Requirement | What it is | Why you need it |
|-------------|-----------|-----------------|
| **NVIDIA JetPack** | OS + drivers for Jetson | Provides CUDA, cuDNN, TensorRT drivers for GPU |
| **Docker Engine** | Container runtime | Isolates each AI workload in its own environment |
| **NVIDIA Container Toolkit** | Docker GPU plugin | Lets Docker containers access the Jetson GPU |
| **Disk space (20GB+)** | Storage | For Docker images, project files, datasets, models |
| **Network** | Internet access | To pull Docker images from NVIDIA NGC registry |

### On Your Local Machine

| Requirement | What it is | Why you need it |
|-------------|-----------|-----------------|
| **Web browser** | Chrome/Firefox/Edge | Access the AI GPU Workbench web UI |
| **Network access to Jetson** | Same LAN or VPN | Connect to `http://<jetson-ip>:3000` |

---

## Setup Guide

### Step 1: Prepare the Jetson

Connect to your Jetson via SSH or directly with a monitor+keyboard, then run:

```bash
# Download the project
git clone <your-repo-url> ai-gpu-workbench
cd ai-gpu-workbench

# Run the Jetson setup script
chmod +x scripts/setup-jetson.sh
sudo ./scripts/setup-jetson.sh
```

**What the setup script does:**

| Action | Details |
|--------|---------|
| Detects GPU | Runs `nvidia-smi` to confirm Jetson GPU is working |
| Installs Docker | If not already installed, installs Docker Engine |
| Configures NVIDIA Container Toolkit | Enables `--runtime=nvidia` for Docker containers |
| Creates workspace directories | Creates `workspace/{projects,outputs,datasets,models,logs,templates}` |
| Installs Python/Node.js | For local dev/debugging if needed |

### Step 2: Build Runtime Docker Images

```bash
./scripts/build-runtimes.sh
```

This builds 5 Docker images with GPU-accelerated AI frameworks:

| Image Name | Size | Contents | Use For |
|-----------|------|----------|---------|
| `ai-gpu-workbench-pytorch` | ~8GB | PyTorch, torchvision, torchaudio, scikit-learn, Jupyter | General deep learning, LLMs, GANs |
| `ai-gpu-workbench-tensorflow` | ~7GB | TensorFlow 2, scikit-learn, pandas, matplotlib | TF/Keras models, transfer learning |
| `ai-gpu-workbench-cnn` | ~8GB | PyTorch + OpenCV, albumentations, timm, segmentation models | Computer vision, image classification, object detection |
| `ai-gpu-workbench-cuda-generic` | ~4GB | CUDA 12.2 toolkit, PyCUDA, CuPy, Numba | Custom CUDA kernels, low-level GPU programming |
| `ai-gpu-workbench-jupyter` | ~8GB | PyTorch + Jupyter Lab, ipywidgets, Voila, Plotly | Interactive notebooks, data exploration |

> **First build takes 15-30 minutes** depending on Jetson model and internet speed. Subsequent runs use cached layers.

### Step 3: Launch the Platform

```bash
# Start everything (backend + frontend)
docker compose up --build -d

# Wait 30 seconds, then check logs
docker compose logs --tail=50
```

**What Docker Compose starts:**

| Service | Port | Description |
|---------|------|-------------|
| `backend` | `8000` | FastAPI server: project CRUD, file management, GPU detection, execution orchestration |
| `frontend` | `80` | Nginx serving the React SPA: Monaco Editor, file browser, terminal, GPU dashboard |

### Step 4: Access from Your Local Machine

On your local machine, open a browser and go to:

```
http://<jetson-ip-address>:3000
```

Or if running directly on Jetson with a monitor:

```
http://localhost:3000
```

> **Find your Jetson's IP:** Run `ip addr show | grep inet` on the Jetson, or check your router's DHCP client list.

---

## Local Development (Optional)

If you want to modify the platform itself (not just run AI code on it):

### On your local machine (for frontend development)

```bash
cd frontend
npm install
npm run dev     # Starts Vite dev server on port 3000 with HMR
```

### On the Jetson (for backend development)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Runtimes

| Runtime | Docker Image | Use Case |
|---------|-------------|----------|
| PyTorch | `nvcr.io/nvidia/pytorch:23.10-py3` | General deep learning, LLMs |
| TensorFlow | `nvcr.io/nvidia/tensorflow:23.10-tf2-py3` | TF models, Keras |
| CNN | PyTorch + torchvision, OpenCV | Computer vision |
| CUDA | `nvidia/cuda:12.2.2-devel` | Custom CUDA kernels |
| Jupyter | PyTorch + Jupyter Lab | Notebook-based work |

---

## Project Structure

```
ai-gpu-workbench/
├── backend/                # FastAPI server (runs on Jetson)
│   └── app/
│       ├── core/           # Config, GPU detection
│       ├── models/         # Pydantic schemas
│       ├── routers/        # API endpoints
│       └── services/       # Docker executor, business logic
├── frontend/               # React SPA (served by Nginx on Jetson)
│   └── src/
│       ├── components/     # FileBrowser, MonacoEditor, Terminal, etc.
│       ├── pages/          # Dashboard, ProjectWorkspace
│       ├── stores/         # Zustand state management
│       └── types/          # TypeScript interfaces
├── docker/                 # Runtime Dockerfiles (used on Jetson)
│   ├── pytorch/
│   ├── tensorflow/
│   ├── cnn/
│   ├── cuda-generic/
│   └── jupyter/
├── workspace/              # Persistent storage (lives on Jetson)
│   ├── projects/
│   ├── outputs/
│   ├── datasets/
│   ├── models/
│   └── templates/
├── scripts/                # Setup & deployment (run on Jetson)
│   ├── setup-jetson.sh     # One-time Jetson environment preparation
│   ├── build-runtimes.sh   # Build all 5 Docker runtime images
│   └── deploy.sh           # Production deployment via Docker Compose
├── tests/                  # Backend unit tests
├── docker-compose.yml      # Orchestrates backend + frontend services
├── .env                    # Configuration variables
└── README.md
```

---

## GPU Memory Optimization

The platform is optimized for Jetson Orin 8GB:

| Optimization | Setting | Why |
|-------------|---------|-----|
| Container memory limit | 7GB | Leaves 1GB for Jetson OS + Docker overhead |
| CPU limit | 8 cores | Prevents CPU contention |
| Lazy-loaded components | Monaco, charts | Reduces initial frontend bundle size |
| Efficient logging | WebSocket streaming | No polling, minimal network overhead |
| Minimal backend | FastAPI + uvicorn | ~50MB memory footprint |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/gpu/status` | GPU availability |
| GET | `/api/gpu/metrics` | GPU utilization, memory, temp |
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/{id}` | Get project details |
| DELETE | `/api/projects/{id}` | Delete project |
| POST | `/api/projects/{id}/duplicate` | Duplicate project |
| POST | `/api/projects/{id}/upload` | Upload files |
| GET | `/api/projects/{id}/files` | List project files |
| GET | `/api/projects/{id}/file` | Read file content |
| PUT | `/api/projects/{id}/file` | Write file content |
| DELETE | `/api/projects/{id}/file` | Delete file |
| WS | `/ws/execution/ws/{id}` | Execution WebSocket |
| POST | `/api/execution/stop/{id}` | Stop execution |
| GET | `/api/outputs/{id}` | List outputs |
| GET | `/api/outputs/{id}/download/{file}` | Download output |
| GET | `/api/models/{id}` | List trained models |
| GET | `/api/models/{id}/download/{file}` | Download model |
| GET | `/api/templates` | List templates |
| POST | `/api/templates` | Create template |

---

## Testing

```bash
cd tests
pip install pytest pytest-asyncio httpx
pytest -v
```

---

## Security

A full security audit is available in [`docs/security-audit.md`](docs/security-audit.md).

**Key findings:**
- **GPU SAFE** — No write operations to GPU hardware. All GPU interactions are read-only `nvidia-smi` queries or standard Docker GPU passthrough.
- **SYSTEM SAFE** — All system modifications are standard, reversible package installations (Docker, NVIDIA Container Toolkit).
- **Uninstall guide included** — Clear steps for full removal.

## Deployment

```bash
./scripts/deploy.sh
```

---

## License

MIT
