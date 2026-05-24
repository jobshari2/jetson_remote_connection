FROM nvcr.io/nvidia/pytorch:23.10-py3

RUN pip install --no-cache-dir \
    torchvision \
    torchaudio \
    opencv-python-headless \
    Pillow \
    scikit-image \
    matplotlib \
    seaborn \
    tensorboard \
    albumentations \
    timm \
    efficientnet-pytorch \
    segmentation-models-pytorch \
    fastapi \
    uvicorn \
    websockets \
    jupyter

WORKDIR /workspace

CMD ["/bin/bash"]
