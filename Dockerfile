FROM ubuntu:20.04

RUN apt-get -q update \
    && apt-get -q install -y --no-install-recommends apt-utils \
    && apt-get -q install -y --no-install-recommends --allow-downgrades \
    ca-certificates \
    wget \
    libxtst6 \
    libxss1 \
    desktop-file-utils \
    fuse \
    libasound2 \
    libgtk2.0-0 \
    libnss3 \
    xdg-utils \
    xvfb \
    zenity \
    libdbus-glib-1-2 \
    xdotool \
    curl \
    && apt-get clean

# Download
ENV UNITY_DIR="/opt/unity"
ENV UNITY_BIN="${UNITY_DIR}/UnityHub.AppImage"
RUN mkdir "${UNITY_DIR}" \
    && wget --no-verbose -O "${UNITY_BIN}" "https://public-cdn.cloud.unity3d.com/hub/prod/UnityHub.AppImage" \
    && chmod +x "${UNITY_BIN}"

# Extract
RUN cd /tmp \
    && "${UNITY_BIN}" --appimage-extract \
    && ls -alh squashfs-root

# Accept
ENV CONFIG_DIR="/root/.config/Unity Hub"
RUN mkdir -p "${CONFIG_DIR}" && touch "${CONFIG_DIR}/eulaAccepted"

# Configure
RUN mkdir -p "${UNITY_DIR}/editors"

# Accept license
COPY bootstrapper.sh .
COPY no-really-lets-click-everywhere.sh .
