FROM nvcr.io/nvidia/tensorflow:23.10-tf2-py3

RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    websockets \
    matplotlib \
    scikit-learn \
    pandas \
    numpy \
    jupyter

WORKDIR /workspace

CMD ["/bin/bash"]
