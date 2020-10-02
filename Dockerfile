# syntax=docker/dockerfile:experimental
FROM ubuntu:20.04

RUN apt-get -q update \
    && apt-get -q install -y --no-install-recommends apt-utils \
    && apt-get -q install -y --no-install-recommends --allow-downgrades \
    ca-certificates \
    wget \
    libxtst6 \
    libxss1 \
    desktop-file-utils \
    libasound2 \
    libgtk2.0-0 \
    libnss3 \
    xdg-utils \
    xvfb \
    zenity \
    libdbus-glib-1-2 \
    curl \
    xz-utils \
    cpio \
    lsb-release \
    && apt-get clean

# Environment
ENV UNITY_DIR="/opt/unity"

# Download & extract AppImage
RUN --mount=type=tmpfs,target=/tmp \
    wget --no-verbose -O /tmp/UnityHub.AppImage "https://public-cdn.cloud.unity3d.com/hub/prod/UnityHub.AppImage" \
    && chmod +x /tmp/UnityHub.AppImage \
    && cd /tmp \
    && /tmp/UnityHub.AppImage --appimage-extract \
    && cp -R /tmp/squashfs-root/* / \
    && rm -rf /tmp/squashfs-root /tmp/UnityHub.AppImage \
    && mkdir -p "$UNITY_DIR" \
    && mv /AppRun /opt/unity/UnityHub

# Alias to "unity-hub" or simply "hub" with default params
RUN echo '#!/bin/bash\nxvfb-run -e /dev/stdout /opt/unity/UnityHub --no-sandbox --headless "$@"' > /usr/bin/unity-hub \
    && chmod +x /usr/bin/unity-hub \
    && ln -s /usr/bin/unity-hub /usr/bin/hub

# Accept
RUN mkdir -p "/root/.config/Unity Hub" && touch "/root/.config/Unity Hub/eulaAccepted"

# Configure
RUN --mount=type=tmpfs,target=/tmp \
    mkdir -p "${UNITY_DIR}/editors" \
    && unity-hub install-path --set "${UNITY_DIR}/editors/"
