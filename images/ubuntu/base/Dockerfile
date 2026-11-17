ARG ubuntuImage="ubuntu:24.04"
FROM $ubuntuImage

# Fixes a Gradle crash while building for Android on Unity 2019 when there are accented characters in environment variables
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

# Set frontend to Noninteractive in Debian configuration.
# https://github.com/phusion/baseimage-docker/issues/58#issuecomment-47995343
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Global dependencies
# python3 runs WebGL's Emscripten (emcc); Ubuntu 22.04 only brought it in through lsb-release.
RUN apt-get -q update \
 && apt-get -q install -y --no-install-recommends apt-utils \
 && apt-get -q install -y --no-install-recommends --allow-downgrades \
 ca-certificates \
 libasound2t64 \
 libc6-dev \
 libcap2 \
 libglu1 \
 libgtk-3-0t64 \
 libncurses6 \
 libnotify4 \
 libnss3 \
 libvulkan1 \
 mesa-vulkan-drivers \
 libxtst6 \
 libxss1 \
 cpio \
 lsb-release \
 python3 \
 xvfb \
 xz-utils \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && rm -rf /usr/share/icons/* \
 && rm -rf /usr/lib/python3.12/__pycache__/*

# Toolbox
RUN apt-get -q update \
 && apt-get -q install -y --no-install-recommends --allow-downgrades \
 atop \
 curl \
 git \
 git-lfs \
 jq \
 openssh-client \
 wget \
 zip \
 unzip \
 && git lfs install --system --skip-repo \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# libstdc++6 upgrade
RUN apt-get -q update \
 && apt-get install -y --no-install-recommends --allow-downgrades \
 libstdc++6 \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Install OpenSSL 1.1 for older Unity Editors that do not support OpenSSL 3.
# https://forum.unity.com/threads/workaround-for-libssl-issue-on-ubuntu-22-04.1271405/
# The checksum is the one published in the focal-security package index.
ARG libssl11Deb="libssl1.1_1.1.1f-1ubuntu2.24_amd64.deb"
ARG libssl11Sha256="7cf39d70a639017d1dd7c8d36daa2258063608688e449fddf40ffdd46f992a78"
RUN wget -q "https://security.ubuntu.com/ubuntu/pool/main/o/openssl/$libssl11Deb" \
 && echo "$libssl11Sha256  $libssl11Deb" | sha256sum -c - \
 && dpkg -i "$libssl11Deb" \
 && rm "$libssl11Deb"

# Install the Ubuntu 22.04 libraries that Ubuntu 24.04 no longer ships, which Unity still links against:
# - libgconf-2.so.4: the Editor itself (Unity, UnityHelper, libcef.so) up to 2019.4
# - libncurses.so.5, libtinfo.so.5, libpanel.so.5: Android SDK build-tools and NDK (through Unity 6),
#   and the Emscripten Fastcomp toolchain of WebGL (up to 2020.3)
# The checksums are the ones published in the jammy-updates and jammy package indexes.
RUN cd /tmp \
 && pool="https://archive.ubuntu.com/ubuntu/pool/universe" \
 && wget -q \
      "$pool/n/ncurses/libtinfo5_6.3-2ubuntu0.3_amd64.deb" \
      "$pool/n/ncurses/libncurses5_6.3-2ubuntu0.3_amd64.deb" \
      "$pool/g/gconf/gconf2-common_3.2.6-7ubuntu2_all.deb" \
      "$pool/g/gconf/libgconf-2-4_3.2.6-7ubuntu2_amd64.deb" \
 && printf '%s\n' \
      '4df4288404108f1a156d014e8764a064e977e34e6d44931ab60451694c03c90d  libtinfo5_6.3-2ubuntu0.3_amd64.deb' \
      '58da01991712c6856af0658dc5e9cb533c1a6854ab950055ade185e35bc9c276  libncurses5_6.3-2ubuntu0.3_amd64.deb' \
      '627d708d8f282821f3ec7d9f08060cc5b7cc3a737b1e30e91da710c915a71482  gconf2-common_3.2.6-7ubuntu2_all.deb' \
      'ad86a4ee82b2631dab97d16736580f03108524a8040a790a6ef8b20cbd358be4  libgconf-2-4_3.2.6-7ubuntu2_amd64.deb' \
    | sha256sum -c - \
 && apt-get -q update \
 && apt-get -q install -y --no-install-recommends \
      ./libtinfo5_6.3-2ubuntu0.3_amd64.deb \
      ./libncurses5_6.3-2ubuntu0.3_amd64.deb \
      ./gconf2-common_3.2.6-7ubuntu2_all.deb \
      ./libgconf-2-4_3.2.6-7ubuntu2_amd64.deb \
 && rm ./*.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Disable default sound card, which removes ALSA warnings
RUN /bin/echo -e 'pcm.!default {\n\
    type plug\n\
    slave.pcm "null"\n\
}' > /etc/asound.conf

# Xvfb only creates its socket directory as root; non-root users would log "euid != 0" errors
RUN mkdir -p /tmp/.X11-unix && chmod 1777 /tmp/.X11-unix

# Support forward compatibility for unity activation
RUN echo "576562626572264761624c65526f7578" > /etc/machine-id && mkdir -p /var/lib/dbus/ && ln -sf /etc/machine-id /var/lib/dbus/machine-id

# Used by Unity editor in "modules.json" and must not end with a slash.
ENV UNITY_PATH="/opt/unity"
