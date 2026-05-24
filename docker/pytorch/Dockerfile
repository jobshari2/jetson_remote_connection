FROM nvcr.io/nvidia/pytorch:23.10-py3

RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    websockets \
    torchvision \
    torchaudio \
    tensorboard \
    matplotlib \
    scikit-learn \
    pandas \
    numpy \
    jupyter

WORKDIR /workspace

CMD ["/bin/bash"]
