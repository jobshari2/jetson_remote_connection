# AI GPU Workbench — Usage Guide

A step-by-step walkthrough of using the platform to develop and run GPU-accelerated AI/ML projects.

---

## Table of Contents

1. [Accessing the Platform](#1-accessing-the-platform)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Creating a Project](#3-creating-a-project)
4. [Uploading Files & Datasets](#4-uploading-files--datasets)
5. [Editing Code](#5-editing-code)
6. [Running Code on GPU](#6-running-code-on-gpu)
7. [Viewing GPU Metrics](#7-viewing-gpu-metrics)
8. [Downloading Results & Models](#8-downloading-results--models)
9. [Duplicating & Importing/Exporting Projects](#9-duplicating--importingexporting-projects)
10. [Using Templates](#10-using-templates)
11. [Workflow Examples](#11-workflow-examples)
    - [Example A: Train a CNN on GPU](#example-a-train-a-cnn-on-gpu)
    - [Example B: Run a CUDA Kernel](#example-b-run-a-cuda-kernel)
    - [Example C: Jupyter Notebook for Exploratory Analysis](#example-c-jupyter-notebook-for-exploratory-analysis)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Accessing the Platform

Once the platform is running on your Jetson, open a browser on any device on the same network:

```
http://<jetson-ip-address>:3000
```

**Expected screen:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GPU Workbench          │  Dashboard                                   │
│  NVIDIA Jetson Platform │                                              │
│                          │  ┌────────────────────────────────────────┐  │
│  > Dashboard             │  │  New Project                           │  │
│                          │  │                                        │  │
│  PROJECTS                │  │  ┌──────────┐ ┌──────────┐ ┌────────┐ │  │
│                          │  │  │Projects  │ │Total     │ │GPU     │ │  │
│                          │  │  │0         │ │Files     │ │Status  │ │  │
│                          │  │  │          │ │0         │ │Active  │ │  │
│                          │  │  └──────────┘ └──────────┘ └────────┘ │  │
│                          │  │                                        │  │
│                          │  │  ┌──────────────────────────────────┐  │  │
│                          │  │  │  GPU Metrics                     │  │  │
│                          │  │  │  NVIDIA Orin (8GB)               │  │  │
│                          │  │  │  Utilization  ████░░░░ 45%       │  │  │
│                          │  │  │  Memory       ████░░░░ 3.2/7.8GB │  │  │
│                          │  │  │  Temp: 62°C  Power: 12W          │  │  │
│                          │  │  └──────────────────────────────────┘  │  │
│                          │  │                                        │  │
│                          │  │  Projects                              │  │
│                          │  │  ┌──────────────────────────────────┐  │  │
│                          │  │  │  No projects yet                 │  │  │
│                          │  │  │  Create your first project       │  │  │
│                          │  │  └──────────────────────────────────┘  │  │
│                          │  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dashboard Overview

The dashboard is your home screen. It shows:

| Section | Description |
|---------|-------------|
| **Sidebar** | Navigation — links to Dashboard and all your projects |
| **Stats Cards** | Quick counts of projects, total files, and GPU status |
| **GPU Metrics Panel** | Live GPU utilization, memory usage, temperature, power draw |
| **Projects Grid** | Cards for each project — click to open, hover for duplicate/delete |

### GPU Status Indicator

The GPU status card shows one of:
- **Active** (green) — NVIDIA GPU detected and ready
- **Fallback** (amber) — No GPU detected, running CPU-only

---

## 3. Creating a Project

**Step 1:** Click the **"New Project"** button (top-right of dashboard).

**Step 2:** Fill in the form:

```
┌─────────────────────────────────────────────┐
│  New Project                                │
│                                             │
│  Project Name                               │
│  ┌───────────────────────────────────────┐  │
│  │  ResNet Image Classifier              │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Description                                │
│  ┌───────────────────────────────────────┐  │
│  │  Training ResNet-50 on CIFAR-10      │  │
│  │  with GPU acceleration               │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Runtime                                    │
│  ┌───────────────────────────────────────┐  │
│  │  PyTorch                    ▼         │  │
│  └───────────────────────────────────────┘  │
│                                             │
│              [Cancel]    [Create]            │
└─────────────────────────────────────────────┘
```

**Step 3:** Select the appropriate **Runtime** for your task:

| Choose This | When You Want To... |
|-------------|-------------------|
| **PyTorch** | Train neural networks, run LLMs, work with transformers |
| **TensorFlow** | Use Keras/TF2 models, deploy TF SavedModels |
| **CNN** | Build computer vision models (classification, detection, segmentation) |
| **CUDA** | Write custom CUDA kernels, use PyCUDA or CuPy |
| **Jupyter** | Interactive data exploration with notebooks |

**Step 4:** Click **Create**. The project appears in the sidebar and dashboard grid.

---

## 4. Uploading Files & Datasets

### Method A: Click Upload

Click the upload icon (📤) in the File Browser panel to select files from your computer.

### Method B: Drag and Drop

Drag files or folders from your computer directly into the File Browser panel. When dragging over the panel, a green dashed border appears to confirm the drop zone is active.

### After Upload

Uploaded files appear in the File Browser:

```
┌──────────────────────────────┐
│  ▼ Files              📤 ＋   │
│                              │
│  📄 train.py                 │
│  📄 model.py                 │
│  📄 requirements.txt         │
│  📁 datasets/                │
│  📁 utils/                   │
│                              │
│  Right-click a folder to     │
│  navigate into it            │
└──────────────────────────────┘
```

### Supported File Types

| File Type | How It's Handled |
|-----------|-----------------|
| `.py`, `.js`, `.ts`, `.jsx`, `.tsx` | Syntax-highlighted in Monaco Editor |
| `.json`, `.yaml`, `.yml`, `.toml` | Config editing with autocomplete |
| `.csv`, `.tsv` | Data files for training |
| `.jpg`, `.png`, `.npy` | Image/numpy datasets (binary, view in editor not recommended) |
| `.pt`, `.pth`, `.h5`, `.onnx` | Model checkpoints (download only) |

---

## 5. Editing Code

Click any `.py` file in the File Browser to open it in Monaco Editor.

### Editor Features

```
┌─────────────────────────────────────────────────────────────────────────┐
│  train.py  │  model.py  │  utils/data.py  │  [+]                        │
├─────────────────────────────────────────────────────────────────────────┤
│  1  import torch                                                       │
│  2  import torch.nn as nn                                              │
│  3  from model import ResNet50                                         │
│  4                                                                     │
│  5  device = torch.device("cuda" if torch.cuda.is_available() else     │
│  6  model = ResNet50().to(device)                                      │
│  7  optimizer = torch.optim.Adam(model.parameters(), lr=0.001)         │
│  8                                                                     │
│  9  for epoch in range(100):                                           │
│ 10      for batch in dataloader:                                       │
│ 11          x, y = batch                                               │
│ 12          x, y = x.to(device), y.to(device)                          │
│ 13          pred = model(x)                                            │
│ 14          loss = criterion(pred, y)                                  │
│ 15          loss.backward()                                            │
│ 16          optimizer.step()                                           │
│ 17          optimizer.zero_grad()                                      │
│ 18                                                                     │
│ 19      torch.save(model.state_dict(), "/workspace/outputs/model.pt")  │
│ 20      print(f"Epoch {epoch} complete")                               │
├─────────────────────────────────────────────────────────────────────────┤
│  Lines 1-20 of 20  │  Spaces: 4  │  Python  │  UTF-8                   │
└─────────────────────────────────────────────────────────────────────────┘
```

| Feature | How to Use |
|---------|-----------|
| **Multi-tab editing** | Click files to open in new tabs; click tabs to switch |
| **Auto-save** | Changes auto-save 1 second after you stop typing |
| **Syntax highlighting** | Automatic for Python, JS/TS, JSON, HTML, CSS, Markdown, YAML, CUDA C++ |
| **Find & Replace** | `Ctrl+F` / `Cmd+F` |
| **Multiple cursors** | `Alt+Click` to add cursors |
| **Tab size** | 4 spaces (configurable) |

### Writing GPU-Aware Code

Always include CUDA detection in your scripts so they work across environments:

```python
# This pattern is recommended for all projects
import torch

# Automatically uses GPU if available, falls back to CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Move model and data to the device
model = MyModel().to(device)
data = data.to(device)
```

> The platform detects GPU automatically. Even if your code says `if cuda`, the Docker container will have CUDA available.

---

## 6. Running Code on GPU

### The Terminal Panel

The bottom half of the workspace is the **Terminal**, which controls execution:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Terminal           PyTorch ▼                      [Run]  [Clear]       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  --- Running on pytorch ---                                             │
│                                                                         │
│  Using device: cuda                                                     │
│  NVIDIA Jetson Orin 8GB                                                 │
│                                                                         │
│  Epoch 0: loss=2.345, acc=0.45  (2.3s/epoch)                           │
│  Epoch 1: loss=1.823, acc=0.62  (2.1s/epoch)                           │
│  Epoch 2: loss=1.456, acc=0.71  (2.0s/epoch)                           │
│  ...                                                                     │
│  Epoch 49: loss=0.234, acc=0.93  (1.8s/epoch)                          │
│                                                                         │
│  Model saved to /workspace/outputs/model.pt                             │
│  [EXIT CODE: 0]                                                         │
│  [Execution completed]                                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### How to Run

1. **Select a runtime** from the dropdown (PyTorch, TensorFlow, CNN, CUDA, Jupyter)
2. Make sure your code is saved in an open editor tab
3. Click **Run**
4. Watch real-time logs stream into the terminal
5. Click **Stop** at any time to halt execution

### What Happens When You Click Run

```
┌────────────────────────────────────────────────────────────────────────┐
│  1. Backend receives WebSocket "run" command                            │
│  2. Launches Docker container with selected runtime image               │
│  3. Mounts workspace/ → /workspace (all projects & datasets available)  │
│  4. Attaches NVIDIA GPU via --runtime=nvidia                             │
│  5. Executes python3 /workspace/projects/<id>/main.py                    │
│  6. Streams stdout/stderr back via WebSocket in real-time               │
│  7. Saves any outputs written to /workspace/outputs/                    │
│  8. Container stops and is removed automatically                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Writing Outputs

To make results downloadable, write them to `/workspace/outputs/` (this maps to `workspace/outputs/<project-id>/` on the Jetson):

```python
# Inside your code running in the container:
output_path = "/workspace/outputs/model.pt"
torch.save(model.state_dict(), output_path)
print(f"Model saved to {output_path}")

# Plot and save
import matplotlib.pyplot as plt
plt.savefig("/workspace/outputs/training_curve.png")
```

---

## 7. Viewing GPU Metrics

Click the GPU icon (🖥️) in the workspace header to toggle the GPU metrics panel:

```
┌────────────────────────────────┐
│  GPU Metrics              🔄   │
│                                │
│  NVIDIA Orin                   │
│                                │
│  ██████████░░░░  Utilization   │
│                 78%            │
│                                │
│  ██████░░░░░░░░  Memory        │
│  4.2GB / 7.8GB                 │
│                                │
│  🌡️ 68°C    ⚡ 15W            │
│                                │
│  (Auto-refreshes every 5s)     │
└────────────────────────────────┘
```

| Metric | What It Tells You |
|--------|-------------------|
| **Utilization %** | How busy the GPU is — near 100% means GPU-bound |
| **Memory used/total** | VRAM consumption — stay under 7GB on Orin 8GB |
| **Temperature** | Thermal status — throttles above ~85°C |
| **Power draw** | Power consumption — indicates workload intensity |

This panel stays open while you work, helping you optimize your code for the Jetson's 8GB budget.

---

## 8. Downloading Results & Models

### Accessing Outputs

After execution completes, outputs are available via the API:

```bash
# List outputs for a project
curl http://<jetson-ip>:8000/api/outputs/<project-id>

# Download a specific file
curl -O http://<jetson-ip>:8000/api/outputs/<project-id>/download/model.pt

# Download all outputs as a ZIP
curl -o outputs.zip http://<jetson-ip>:8000/api/outputs/<project-id>/download-all
```

### Accessing Trained Models

```bash
# List models
curl http://<jetson-ip>:8000/api/models/<project-id>

# Download a model
curl -O http://<jetson-ip>:8000/api/models/<project-id>/download/model.pt
```

> The output and model directories are separate. Write to `/workspace/outputs/` for general outputs, or `/workspace/models/` specifically for trained model files. Both are accessible via their respective download endpoints.

---

## 9. Duplicating & Importing/Exporting Projects

### Duplicate a Project

Hover over a project card on the dashboard and click the **copy icon** (📋). A new project is created with "(Copy)" appended to the name.

### Export a Project

```bash
# Downloads a ZIP of the entire project
curl -o my-project.zip http://<jetson-ip>:8000/api/projects/<project-id>/export
```

### Import a Project

```bash
# Upload a previously exported ZIP
curl -X POST http://<jetson-ip>:8000/api/projects/import-zip \
  -F "file=@my-project.zip"
```

---

## 10. Using Templates

Templates allow you to save project structures for reuse.

### Create a Template from a Project

1. Set up a project with starter files and configuration
2. Use the API to save it as a template:

```bash
curl -X POST http://<jetson-ip>:8000/api/templates \
  -H "Content-Type: application/json" \
  -d '{"name": "CNN Starter", "description": "ResNet template with data loader", "runtime": "cnn"}'
```

### Apply a Template to a New Project

```bash
curl -X POST http://<jetson-ip>:8000/api/templates/<template-id>/apply/<project-id>
```

This copies all template files into the project.

---

## 11. Workflow Examples

### Example A: Train a CNN on GPU

**Goal:** Train a ResNet-18 image classifier on CIFAR-10 using GPU.

**1. Create Project**
- Name: `CIFAR-10 Classifier`
- Runtime: **CNN**

**2. Create `train.py`**

```python
import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as T

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using: {device}")

transform = T.Compose([T.ToTensor(), T.Normalize((0.5,), (0.5,))])
trainset = torchvision.datasets.CIFAR10(root="/workspace/datasets", train=True, download=True, transform=transform)
trainloader = torch.utils.data.DataLoader(trainset, batch_size=64, shuffle=True)

model = torchvision.models.resnet18(num_classes=10).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(5):
    running_loss = 0.0
    for images, labels in trainloader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()
    print(f"Epoch {epoch+1}: loss={running_loss/len(trainloader):.4f}")

torch.save(model.state_dict(), "/workspace/outputs/cifar10_resnet18.pth")
print("Model saved!")
```

**3. Upload:** Drag `train.py` into the File Browser.

**4. Run:** Select **CNN** runtime, click **Run**.

**Expected output in terminal:**

```
Using: cuda
Downloading CIFAR-10 to /workspace/datasets...
Files already downloaded
Using device: cuda
Epoch 1: loss=1.8234
Epoch 2: loss=1.4567
Epoch 3: loss=1.2345
Epoch 4: loss=1.0987
Epoch 5: loss=0.9876
Model saved!
[EXIT CODE: 0]
[Execution completed]
```

**5. Download the model:**

```bash
curl -O http://<jetson-ip>:8000/api/outputs/<project-id>/download/cifar10_resnet18.pth
```

---

### Example B: Run a CUDA Kernel

**Goal:** Write and execute a custom CUDA kernel for vector addition.

**1. Create Project**
- Name: `CUDA Vector Add`
- Runtime: **CUDA**

**2. Create `vector_add.cu`**

```cpp
#include <stdio.h>

__global__ void vector_add(float *a, float *b, float *c, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}

int main() {
    int n = 1 << 20;
    size_t size = n * sizeof(float);

    float *h_a = (float*)malloc(size);
    float *h_b = (float*)malloc(size);
    float *h_c = (float*)malloc(size);

    for (int i = 0; i < n; i++) {
        h_a[i] = i * 1.0f;
        h_b[i] = i * 2.0f;
    }

    float *d_a, *d_b, *d_c;
    cudaMalloc(&d_a, size);
    cudaMalloc(&d_b, size);
    cudaMalloc(&d_c, size);

    cudaMemcpy(d_a, h_a, size, cudaMemcpyHostToDevice);
    cudaMemcpy(d_b, h_b, size, cudaMemcpyHostToDevice);

    int threads = 256;
    int blocks = (n + threads - 1) / threads;
    vector_add<<<blocks, threads>>>(d_a, d_b, d_c, n);

    cudaMemcpy(h_c, d_c, size, cudaMemcpyDeviceToHost);

    printf("c[0] = %f (expected 0.0)\n", h_c[0]);
    printf("c[1] = %f (expected 3.0)\n", h_c[1]);
    printf("c[%d] = %f (expected %f)\n", n-1, h_c[n-1], (n-1)*3.0f);

    cudaFree(d_a); cudaFree(d_b); cudaFree(d_c);
    free(h_a); free(h_b); free(h_c);

    return 0;
}
```

**3. Create `Makefile`**

```makefile
all:
    nvcc -o vector_add vector_add.cu

run: all
    ./vector_add
```

**4. Create `run.py`** (the entry point the executor calls)

```python
import subprocess
result = subprocess.run(["nvcc", "-o", "/workspace/outputs/vector_add", "vector_add.cu"],
                       capture_output=True, text=True)
print(result.stdout, result.stderr)

result = subprocess.run(["/workspace/outputs/vector_add"],
                       capture_output=True, text=True)
print(result.stdout)
print(result.stderr)
```

**5. Run:** Select **CUDA** runtime, click **Run**.

**Expected output:**

```
c[0] = 0.000000 (expected 0.0)
c[1] = 3.000000 (expected 3.0)
c[1048575] = 3145725.000000 (expected 3145725.0)
[EXIT CODE: 0]
```

---

### Example C: Jupyter Notebook for Exploratory Analysis

**1. Create Project**
- Name: `Data Exploration`
- Runtime: **Jupyter**

**2. Upload your dataset** (e.g., `data.csv`) to the project via drag-and-drop.

**3. Create `explore.ipynb`** — a Jupyter notebook file. The executor will launch a Jupyter Lab instance instead of running a Python script.

**4. Run:** Select **Jupyter** runtime, click **Run**.

**Expected output:**

```
[Jupyter Notebook server] Serving at http://0.0.0.0:8888
[Jupyter Notebook server] Token: abc123def456
```

**5. Access Jupyter:** Open a new browser tab at `http://<jetson-ip>:8888` (you may need to expose port 8888 in docker-compose for this).

---

## 12. Troubleshooting

### "GPU not detected" on Dashboard

| Cause | Solution |
|-------|----------|
| NVIDIA Container Toolkit not installed | Run `sudo ./scripts/setup-jetson.sh` |
| Docker not started with nvidia runtime | Check `docker info | grep nvidia` |
| Container limits too low | Check Docker resources in Docker Desktop settings |

### "Docker image not found" when running

Build the runtime images first:
```bash
./scripts/build-runtimes.sh
```

### Out of memory errors

Jetson Orin 8GB has limited VRAM:
- Reduce batch size in your training script
- Use mixed precision (`torch.cuda.amp`)
- Enable gradient checkpointing
- Monitor GPU memory in the metrics panel

### Container not starting

Check Docker logs:
```bash
docker compose logs backend
docker compose logs frontend
```

### Port already in use

Change ports in `.env`:
```env
HOST=0.0.0.0
PORT=8001
```

Then update `docker-compose.yml` port mapping accordingly.

### Slow execution

- Ensure you selected the correct runtime (PyTorch code on PyTorch image)
- Check GPU utilization — if near 100%, you're GPU-bound (increase batch size)
- If GPU utilization is low but it's slow, you may be CPU or I/O bound
- Use `torch.utils.data.DataLoader(num_workers=2)` for faster data loading

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         QUICK REFERENCE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ACCESS:     http://<jetson-ip>:3000                                    │
│  API:        http://<jetson-ip>:8000/docs                               │
│  SETUP:      sudo ./scripts/setup-jetson.sh                             │
│  BUILD:      ./scripts/build-runtimes.sh                                │
│  START:      docker compose up --build -d                               │
│  STOP:       docker compose down                                        │
│  LOGS:       docker compose logs -f                                     │
│                                                                         │
│  DEVICE:     device = torch.device("cuda" if torch.cuda.is_available()  │
│              else "cpu")                                                │
│  OUTPUTS:    Write to /workspace/outputs/ for download                  │
│  DATASETS:   Upload via UI or place in workspace/datasets/              │
│  MODELS:     Written to /workspace/models/ or /workspace/outputs/      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
