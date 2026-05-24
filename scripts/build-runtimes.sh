#!/bin/bash
set -euo pipefail

echo "=== Building Runtime Docker Images ==="

docker build -t ai-gpu-workbench-pytorch -f docker/pytorch/Dockerfile .
docker build -t ai-gpu-workbench-tensorflow -f docker/tensorflow/Dockerfile .
docker build -t ai-gpu-workbench-cnn -f docker/cnn/Dockerfile .
docker build -t ai-gpu-workbench-cuda-generic -f docker/cuda-generic/Dockerfile .
docker build -t ai-gpu-workbench-jupyter -f docker/jupyter/Dockerfile .

echo "=== All runtime images built ==="
docker images | grep ai-gpu-workbench
