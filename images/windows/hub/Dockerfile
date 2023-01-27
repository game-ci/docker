ARG baseImage="unityci/base:windows-latest"

FROM $baseImage
ARG hubVersion="3.0.0"

# Install unity hub
RUN choco install unity-hub --version=%hubVersion --no-progress -y
