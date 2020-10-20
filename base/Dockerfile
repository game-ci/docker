FROM ubuntu:20.04

# Global dependencies
RUN apt-get -q update \
 && apt-get -q install -y --no-install-recommends apt-utils \
 && apt-get -q install -y --no-install-recommends --allow-downgrades \
 ca-certificates \
 libasound2 \
 libgconf-2-4 \
 libgtk-3-0 \
 libnss3 \
 libxtst6 \
 libxss1 \
 atop \
 cpio \
 curl \
 lsb-release \
 wget \
 xvfb \
 xz-utils \
 && apt-get clean

# Support forward compatibility for unity activation
RUN echo "576562626572264761624c65526f7578" > /etc/machine-id && ln -sf /etc/machine-id /var/lib/dbus/machine-id

# Used by Unity editor in "modules.json" and must not end with a slash.
ENV UNITY_PATH="/opt/unity"
