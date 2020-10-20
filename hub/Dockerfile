ARG baseImage="unityci/base"
FROM $baseImage

# Hub dependencies
RUN apt-get -q update \
 && apt-get -q install -y --no-install-recommends --allow-downgrades zenity \
 && apt-get clean

# Download & extract AppImage
RUN wget --no-verbose -O /tmp/UnityHub.AppImage "https://public-cdn.cloud.unity3d.com/hub/prod/UnityHub.AppImage" \
 && chmod +x /tmp/UnityHub.AppImage \
 && cd /tmp \
 && /tmp/UnityHub.AppImage --appimage-extract \
 && cp -R /tmp/squashfs-root/* / \
 && rm -rf /tmp/squashfs-root /tmp/UnityHub.AppImage \
 && mkdir -p "$UNITY_PATH" \
 && mv /AppRun /opt/unity/UnityHub

# Alias to "unity-hub" with default params
RUN echo '#!/bin/bash\nxvfb-run -ae /dev/stdout /opt/unity/UnityHub --no-sandbox --headless "$@"' > /usr/bin/unity-hub \
 && chmod +x /usr/bin/unity-hub

# Accept
RUN mkdir -p "/root/.config/Unity Hub" \
 && touch "/root/.config/Unity Hub/eulaAccepted"

# Configure
RUN mkdir -p "${UNITY_PATH}/editors" \
 && unity-hub install-path --set "${UNITY_PATH}/editors/" \
 && find /tmp -mindepth 1 -delete
