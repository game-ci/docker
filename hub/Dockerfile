ARG baseImage="unityci/base"
FROM $baseImage

# Hub dependencies
RUN sudo apt-get -q update \
 && sudo apt-get -q install -y --no-install-recommends --allow-downgrades zenity \
 && sudo apt-get clean

# Download & extract AppImage
RUN wget --no-verbose -O /tmp/UnityHub.AppImage "https://public-cdn.cloud.unity3d.com/hub/prod/UnityHub.AppImage" \
 && chmod +x /tmp/UnityHub.AppImage \
 && cd /tmp \
 && /tmp/UnityHub.AppImage --appimage-extract \
 && mkdir -p "$UNITY_PATH" \
 && cp -R /tmp/squashfs-root/* $UNITY_PATH \
 && rm -rf /tmp/squashfs-root /tmp/UnityHub.AppImage \
 && mv $UNITY_PATH/AppRun $UNITY_PATH/UnityHub

# Alias to "unity-hub" with default params
RUN echo '#!/bin/bash\nAPPIMAGE_SILENT_INSTALL=true APPDIR=$UNITY_PATH xvfb-run -ae /dev/stdout $UNITY_PATH/UnityHub --no-sandbox --headless "$@"' > /usr/bin/unity-hub \
 && chmod +x /usr/bin/unity-hub

# Configure
RUN mkdir -p "${UNITY_PATH}/editors" \
 && unity-hub install-path --set "${UNITY_PATH}/editors/" \
 && find /tmp -mindepth 1 -delete 2> /dev/null
