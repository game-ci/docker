FROM ubuntu:18.04

# Runner user parameters
ARG UNAME=runner
ENV UNAME=$UNAME
ARG UID=1000
ENV UID=$UID
ARG GID=1000
ENV GID=$GID

# Global dependencies
RUN apt-get -q update \
 && apt-get -q install -y --no-install-recommends apt-utils \
 && apt-get -q install -y --no-install-recommends --allow-downgrades \
 ca-certificates \
 libasound2 \
 libc6-dev \
 libcap2 \
 libgconf-2-4 \
 libglu1 \
 libgtk-3-0 \
 libncurses5 \
 libnss3 \
 libxtst6 \
 libxss1 \
 cpio \
 lsb-release \
 xvfb \
 xz-utils \
 && apt-get clean

# Toolbox
RUN apt-get -q update \
 && apt-get -q install -y --no-install-recommends --allow-downgrades \
 sudo \
 atop \
 curl \
 git \
 git-lfs \
 wget \
 && git lfs install --system --skip-repo \
 && apt-get clean

# Disable default sound card, which removes ALSA warnings
ADD config/asound.conf /etc/

# Support forward compatibility for unity activation
RUN echo "576562626572264761624c65526f7578" > /etc/machine-id && mkdir -p /var/lib/dbus/ && ln -sf /etc/machine-id /var/lib/dbus/machine-id

# Used by Unity editor in "modules.json" and must not end with a slash.
ENV UNITY_PATH="/opt/unity"

# Fixes a Gradle crash while building for Android on Unity 2019 when there are accented characters in environment variables
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

# Create the runner user
RUN groupadd -g $GID $UNAME
RUN useradd -u $UID -g $UNAME -s /bin/sh -m $UNAME

# Give relevant executable folders to runner user
RUN mkdir -p $UNITY_PATH && chown $UID:$GID $UNITY_PATH
RUN chown $UID:$GID /usr/bin

# Let the runner user use apt-get and rm without a password
RUN echo ${UNAME}" ALL = NOPASSWD : /bin/rm , /usr/bin/apt-get" > /etc/sudoers.d/apt

# Run as runner user for the rest of the steps
USER $UID:$GID
