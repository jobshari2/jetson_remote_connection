FROM nvcr.io/nvidia/cuda:12.2.2-devel-ubuntu22.04

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    cmake \
    git \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir \
    fastapi \
    uvicorn \
    websockets \
    numpy \
    pycuda \
    numba \
    cupy-cuda12x \
    jupyter

WORKDIR /workspace

CMD ["/bin/bash"]
