# AI GPU Workbench: Windows Setup Script
Write-Host "=== AI GPU Workbench: Windows Setup ===" -ForegroundColor Cyan

# Check Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker not found. Install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
    exit 1
}
Write-Host "Docker: $(docker --version)" -ForegroundColor Green

# Check NVIDIA Docker support
$nvidiaRuntime = docker info 2>&1 | Select-String "nvidia"
if (-not $nvidiaRuntime) {
    Write-Host "NOTE: Install NVIDIA Container Toolkit for GPU support." -ForegroundColor Yellow
    Write-Host "See: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html" -ForegroundColor Yellow
}

# Create workspace directories
$workspaceDirs = @("workspace/projects", "workspace/outputs", "workspace/datasets", "workspace/models", "workspace/logs", "workspace/templates")
foreach ($dir in $workspaceDirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}
Write-Host "Workspace directories created." -ForegroundColor Green

# Create .env if not exists
if (-not (Test-Path .env)) {
    @"
WORKSPACE_DIR=./workspace
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000
MAX_UPLOAD_SIZE_MB=500
GPU_ENABLED=true
DEFAULT_RUNTIME=pytorch
"@ | Set-Content -Path .env
    Write-Host ".env file created." -ForegroundColor Green
}

Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Run 'docker compose up --build' to start the platform." -ForegroundColor Yellow
