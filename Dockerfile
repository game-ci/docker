FROM ubuntu:20.04

RUN apt-get -q update \
    && apt-get -q install -y --no-install-recommends apt-utils \
    && apt-get -q install -y --no-install-recommends --allow-downgrades \
    ca-certificates \
    wget \
    desktop-file-utils \
    fuse \
    libasound2 \
    libgtk2.0-0 \
    libnss3 \
    xdg-utils \
    xvfb \
    zenity \
    libdbus-glib-1-2 \
    && apt-get clean

ENV UNITY_DIR="/opt/unity"
ENV UNITY_BIN="${UNITY_DIR}/UnityHub.AppImage"

# Download
RUN mkdir "${UNITY_DIR}" \
    && wget --no-verbose -O "${UNITY_BIN}" 'https://public-cdn.cloud.unity3d.com/hub/prod/UnityHub.AppImage' \
    && chmod +x "${UNITY_BIN}"

# Extract
RUN mkdir -p /usr/local/share/applications \
    && cd /tmp \
    && "${UNITY_BIN}" --appimage-extract \
    && ls -alh squashfs-root