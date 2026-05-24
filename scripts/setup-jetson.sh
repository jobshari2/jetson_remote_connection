#!/bin/bash
set -euo pipefail

echo "=== AI GPU Workbench: Jetson Setup ==="

check_gpu() {
    if command -v nvidia-smi &>/dev/null; then
        echo "NVIDIA GPU detected"
        nvidia-smi --query-gpu=name,memory.total,compute_cap --format=csv,noheader
    elif [ -f /proc/device-tree/model ] && grep -qi "jetson" /proc/device-tree/model; then
        echo "Jetson platform detected"
    else
        echo "WARNING: No NVIDIA GPU detected. Running in CPU-only fallback mode."
    fi
}

check_docker() {
    if ! command -v docker &>/dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com | sh
        sudo usermod -aG docker "$USER"
    fi
    echo "Docker: $(docker --version)"
}

check_nvidia_container_toolkit() {
    if ! docker info 2>/dev/null | grep -qi "nvidia"; then
        echo "Installing NVIDIA Container Toolkit..."
        distribution=$(. /etc/os-release;echo "$ID$VERSION_ID")
        curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
        curl -sL "https://github.com/NVIDIA/nvidia-docker/raw/master/nvidia-docker.list" | \
            sed "s#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g" | \
            sudo tee /etc/apt/sources.list.d/nvidia-docker.list
        sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
        sudo nvidia-ctk runtime configure --runtime=docker
        sudo systemctl restart docker
    fi
    echo "NVIDIA Container Toolkit: configured"
}

install_deps() {
    sudo apt-get update
    sudo apt-get install -y python3-pip python3-venv nodejs npm curl wget
    pip3 install --upgrade pip setuptools wheel
}

setup_workspace_dirs() {
    mkdir -p workspace/{projects,outputs,datasets,models,logs,templates}
    chmod -R 755 workspace
}

check_gpu
check_docker
check_nvidia_container_toolkit
install_deps
setup_workspace_dirs

echo "=== Setup Complete ==="
echo "Run 'docker compose up --build' to start the platform."
