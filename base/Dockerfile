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

# Used by Unity editor in "modules.json" and must not end with a slash.
ENV UNITY_PATH="/opt/unity"
