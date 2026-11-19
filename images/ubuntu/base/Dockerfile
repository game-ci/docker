ARG ubuntuImage="ubuntu:24.04"

# Containers may run as any uid (docker run --user, Kubernetes, OpenShift, Jenkins), often one
# with no entry in /etc/passwd. Unity's Licensing Client and Unity Hub need a user name for the
# current user, so this NSS module answers for that uid only, after /etc/passwd ("files").
# https://github.com/game-ci/docker/issues/242
FROM $ubuntuImage AS current-user-nss

COPY <<'EOF' /src/nss_currentuser.c
// NSS passwd module: gives the calling process's own uid a user entry when no other
// source has one. Listed after "files" in /etc/nsswitch.conf, so every user in
// /etc/passwd, root included, resolves exactly as before.
//
// The entry is named CURRENT_USER_NAME, uses the process's gid and shell /bin/sh, and has
// $HOME (or "/") as its home directory, matching the HOME that Docker sets for a uid
// with no /etc/passwd entry.
#define _GNU_SOURCE
#include <errno.h>
#include <nss.h>
#include <pwd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define CURRENT_USER_NAME "unity"

static int is_current_user(uid_t uid) {
  return uid == getuid() || uid == geteuid();
}

// Reads /etc/passwd directly: asking NSS here would reach this module again.
static int has_passwd_file_entry(uid_t uid) {
  FILE *file = fopen("/etc/passwd", "re");
  if (file == NULL) return 0;
  struct passwd entry, *found;
  char buffer[4096];
  int listed = 0;
  while (!listed && fgetpwent_r(file, &entry, buffer, sizeof buffer, &found) == 0) {
    listed = found->pw_uid == uid;
  }
  fclose(file);
  return listed;
}

static char *copy_into(char **cursor, size_t *remaining, const char *value) {
  size_t length = strlen(value) + 1;
  if (length > *remaining) return NULL;
  char *destination = memcpy(*cursor, value, length);
  *cursor += length;
  *remaining -= length;
  return destination;
}

static enum nss_status fill_entry(uid_t uid, struct passwd *result, char *buffer, size_t buflen,
                                  int *errnop) {
  const char *home = secure_getenv("HOME");
  if (home == NULL || home[0] != '/') home = "/";

  char *cursor = buffer;
  size_t remaining = buflen;
  result->pw_name = copy_into(&cursor, &remaining, CURRENT_USER_NAME);
  result->pw_passwd = copy_into(&cursor, &remaining, "x");
  result->pw_gecos = copy_into(&cursor, &remaining, "");
  result->pw_dir = copy_into(&cursor, &remaining, home);
  result->pw_shell = copy_into(&cursor, &remaining, "/bin/sh");
  if (!result->pw_name || !result->pw_passwd || !result->pw_gecos || !result->pw_dir ||
      !result->pw_shell) {
    *errnop = ERANGE;
    return NSS_STATUS_TRYAGAIN;
  }
  result->pw_uid = uid;
  result->pw_gid = getgid();
  return NSS_STATUS_SUCCESS;
}

enum nss_status _nss_currentuser_getpwuid_r(uid_t uid, struct passwd *result, char *buffer,
                                            size_t buflen, int *errnop) {
  if (!is_current_user(uid)) return NSS_STATUS_NOTFOUND;
  return fill_entry(uid, result, buffer, buflen, errnop);
}

enum nss_status _nss_currentuser_getpwnam_r(const char *name, struct passwd *result, char *buffer,
                                            size_t buflen, int *errnop) {
  uid_t uid = geteuid();
  if (strcmp(name, CURRENT_USER_NAME) != 0 || has_passwd_file_entry(uid)) return NSS_STATUS_NOTFOUND;
  return fill_entry(uid, result, buffer, buflen, errnop);
}
EOF

RUN apt-get -q update \
  && apt-get -q install -y --no-install-recommends gcc libc6-dev \
  && gcc -shared -fPIC -O2 -Wall -Wextra -Werror -Wl,-soname,libnss_currentuser.so.2 \
       -o /libnss_currentuser.so.2 /src/nss_currentuser.c

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

# Any uid gets a user name (see the current-user-nss stage) and a writable home: Docker sets
# HOME=/ for a uid with no /etc/passwd entry. Unity writes to ~/.config, ~/.local/share and ~/.cache
# without creating their parents.
COPY --from=current-user-nss /libnss_currentuser.so.2 /usr/local/lib/libnss_currentuser.so.2
RUN ldconfig \
 && sed -i -E 's/^(passwd:.*)$/\1 currentuser/' /etc/nsswitch.conf \
 && grep -Eq '^passwd:.* currentuser$' /etc/nsswitch.conf \
 && mkdir -p /.cache /.config /.local/share \
 && chmod 1777 /.cache /.config /.local /.local/share

# Support forward compatibility for unity activation
RUN echo "576562626572264761624c65526f7578" > /etc/machine-id && mkdir -p /var/lib/dbus/ && ln -sf /etc/machine-id /var/lib/dbus/machine-id

# Used by Unity editor in "modules.json" and must not end with a slash.
ENV UNITY_PATH="/opt/unity"
