ARG hubImage="unityci/hub"
ARG baseImage="unityci/base"

###########################
#         Builder         #
###########################

FROM $hubImage AS builder

# Install editor
ARG version
ARG changeSet
RUN unity-hub install --version "$version" --changeset "$changeSet" | grep 'Error' | exit $(wc -l)

# Install modules for that editor
ARG module="non-existent-module"
RUN if [ "$module" = "base" ] ; then \
      echo "running default modules for this baseOs" ; exit 0 ; \
    else \
      unity-hub install-modules --version "$version" --module "$module" --childModules | grep 'Missing module' | exit $(wc -l) ; \
    fi

###########################
#          Editor         #
###########################

FROM $baseImage

# Always put "Editor" and "modules.json" directly in $UNITY_PATH
ARG version
ARG module
COPY --from=builder /opt/unity/editors/$version/ "$UNITY_PATH/"

# Add a file containing the version for this build
RUN echo $version > "$UNITY_PATH/version"


###########################
#  Alias to unity-editor  #
###########################

RUN echo '#!/bin/bash' > /usr/bin/unity-editor \
  && chmod +x /usr/bin/unity-editor

#=======================================================================================
# [2019.3.[0-5]-linux-il2cpp] https://github.com/game-ci/docker/issues/76
#=======================================================================================
RUN [ `echo $version-$module | grep -v '^2019.3.[0-5]f.*-linux-il2cpp'` ] && exit 0 || : \
  && echo 'export IL2CPP_ADDITIONAL_ARGS=--tool-chain-path=/' >> /usr/bin/unity-editor

#=======================================================================================
# [2019.3.6+/2019.4.0-linux-il2cpp] https://forum.unity.com/threads/unity-2019-3-linux-il2cpp-player-can-only-be-built-with-linux-error.822210/#post-5633977
#=======================================================================================
RUN [ `echo $version-$module | grep -v '^\(2019.3.[6-9]f\|2019.3.1[0-9]f\|2019.4.0\).*-linux-il2cpp'` ] && exit 0 || : \
  && echo 'export IL2CPP_ADDITIONAL_ARGS="--sysroot-path=/ --tool-chain-path=/"' >> /usr/bin/unity-editor

#=======================================================================================
# [2020.x/2020.2.0/2020.2.1-webgl] Support GZip compression: https://github.com/game-ci/docker/issues/75
#=======================================================================================
RUN [ `echo $version-$module | grep -v '^\(2020.1\|2020.2.0f\|2020.2.1f\).*-webgl'` ] && exit 0 || : \
  && echo 'export GZIP=-f' >> /usr/bin/unity-editor

RUN echo 'xvfb-run -ae /dev/stdout "$UNITY_PATH/Editor/Unity" -batchmode "$@"' >> /usr/bin/unity-editor


###########################
#       Extra steps       #
###########################

#=======================================================================================
# [2018.x-android] Install 'Android SDK 26.1.1' and 'Android NDK 16.1.4479499'
#=======================================================================================
RUN [ `echo $version-$module | grep -v '^\(2018.3\|2018.4\).*-android'` ] && exit 0 || : \
  \
  # Versions
  && export ANDROID_BUILD_TOOLS_VERSION=28.0.3 \
  && export ANDROID_NDK_VERSION=16.1.4479499 \
  \
  # Environment Variables
  && export ANDROID_INSTALL_LOCATION=${UNITY_PATH}/Editor/Data/PlaybackEngines/AndroidPlayer \
  && export ANDROID_SDK_ROOT=${ANDROID_INSTALL_LOCATION}/SDK \
  && export ANDROID_HOME=${ANDROID_SDK_ROOT} \
  && export ANDROID_NDK_HOME=${ANDROID_SDK_ROOT}/ndk/${ANDROID_NDK_VERSION} \
  && export JAVA_HOME=${UNITY_PATH}/Editor/Data/PlaybackEngines/AndroidPlayer/Tools/OpenJDK/Linux \
  && export PATH=$JAVA_HOME/bin:${ANDROID_SDK_ROOT}/tools:${ANDROID_SDK_ROOT}/tools/bin:${ANDROID_SDK_ROOT}/platform-tools:${PATH} \
  \
  # Download Android SDK (commandline tools) 26.1.1
  && apt-get update -qq \
  && apt-get install -qq -y --no-install-recommends unzip \
  && mkdir -p ${ANDROID_SDK_ROOT} \
  && chown -R 777 ${ANDROID_INSTALL_LOCATION} \
  && wget -q https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip -O /tmp/android-sdk.zip \
  && unzip -q /tmp/android-sdk.zip -d ${ANDROID_SDK_ROOT} \
  \
  # Install platform-tools, NDK 16.1.4479499 and build-tools 28.0.3
  && yes | sdkmanager \
    "platform-tools" \
    "ndk;${ANDROID_NDK_VERSION}" \
    "build-tools;${ANDROID_BUILD_TOOLS_VERSION}" \
    > /dev/null \
  \
  # Accept licenses
  && yes | "${ANDROID_HOME}/tools/bin/sdkmanager" --licenses \
  \
  # Clean up
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /tmp/* \
  \
  # Update alias 'unity-editor'
  && { \
    echo '#!/bin/bash'; \
    echo ''; \
    echo "export ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT}"; \
    echo "export ANDROID_HOME=${ANDROID_HOME}"; \
    echo "export ANDROID_NDK_HOME=${ANDROID_NDK_HOME}"; \
    echo "export JAVA_HOME=${JAVA_HOME}"; \
    echo "export PATH=${PATH}"; \
    echo ''; \
    echo 'xvfb-run -ae /dev/stdout "$UNITY_PATH/Editor/Unity" -batchmode "$@"'; \
  } > /usr/bin/unity-editor \
  && chmod +x /usr/bin/unity-editor

#=======================================================================================
# [2019.x/2020.x/2021.x-android] Support usage of installed Android SDKs outside of editor
#=======================================================================================
RUN [ `echo $version-$module | grep -v '^20(?!18).*-android'` ] && exit 0 || : \
  \
  # Environment Variables
  && export RAW_ANDROID_SDK_ROOT=$(jq -cr '(.[] | select(.id == "android-sdk-platform-tools")).destination' $UNITY_PATH/modules.json) \
  && export ANDROID_SDK_ROOT=${RAW_ANDROID_SDK_ROOT/'{UNITY_PATH}'/$UNITY_PATH} \
  && export RAW_ANDROID_NDK_ROOT=$(jq -cr '(.[] | select(.id == "android-ndk")).destination' $UNITY_PATH/modules.json) \
  && export ANDROID_NDK_ROOT=${RAW_ANDROID_NDK_ROOT/'{UNITY_PATH}'/$UNITY_PATH} \
  && export RAW_JAVA_HOME=$(jq -cr '(.[] | select(.id == "android-open-jdk")).destination' $UNITY_PATH/modules.json) \
  && export JAVA_HOME=${RAW_JAVA_HOME/'{UNITY_PATH}'/$UNITY_PATH} \
  && export PATH=$JAVA_HOME/bin:${ANDROID_SDK_ROOT}/tools:${ANDROID_SDK_ROOT}/tools/bin:${ANDROID_SDK_ROOT}/platform-tools:${PATH} \
  \
  # Accept licenses
  && yes | "${ANDROID_HOME}/tools/bin/sdkmanager" --licenses \
  \
  # Update alias 'unity-editor'
  && { \
    echo '#!/bin/bash'; \
    echo ''; \
    echo "export ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT}"; \
    echo "export ANDROID_HOME=${ANDROID_SDK_ROOT}"; \
    echo "export ANDROID_NDK_HOME=${ANDROID_NDK_ROOT}"; \
    echo "export JAVA_HOME=${JAVA_HOME}"; \
    echo "export PATH=${PATH}"; \
    echo ''; \
    echo 'xvfb-run -ae /dev/stdout "$UNITY_PATH/Editor/Unity" -batchmode "$@"'; \
  } > /usr/bin/unity-editor \
  && chmod +x /usr/bin/unity-editor \
  && { \
    echo "export ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT}"; \
    echo "export ANDROID_HOME=${ANDROID_SDK_ROOT}"; \
    echo "export ANDROID_NDK_HOME=${ANDROID_NDK_ROOT}"; \
    echo "export JAVA_HOME=${JAVA_HOME}"; \
    echo "export PATH=${PATH}"; \
  } > ~/.bashrc

#=======================================================================================
# [webgl] Support audio using ffmpeg (~99MB)
#=======================================================================================
RUN [ `echo $module | grep -v 'webgl'` ] && exit 0 || : \
  && apt-get update \
  && apt-get -q install -y --no-install-recommends --allow-downgrades \
    ffmpeg \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

#=======================================================================================
# [webgl, il2cpp] python python-setuptools build-essential clang
#=======================================================================================
RUN [ `echo $module | grep -v '\(webgl\|linux-il2cpp\)'` ] && exit 0 || : \
  && apt-get -q update \
  && apt-get -q install -y --no-install-recommends --allow-downgrades \
    python \
    python-setuptools \
    build-essential \
    clang \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

#=======================================================================================
# [2019.x] libnotify4 libunwind-dev libssl1.0
#=======================================================================================
RUN [ `echo $version | grep -v '^2019.'` ] && exit 0 || : \
  && apt-get -q update \
  && apt-get -q install -y --no-install-recommends --allow-downgrades \
    libnotify4 \
    libunwind-dev \
    libssl1.0  \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

#=======================================================================================
# [2018.x/2019.x/2020.1.x-webgl] support brotli compression for linux
#=======================================================================================
RUN [ `echo $version-$module | grep -v '^\(2018\|2019\|2020.1\).*-webgl'` ] && exit 0 || : \
  && cp \
    $UNITY_PATH/Editor/Data/PlaybackEngines/WebGLSupport/BuildTools/Brotli/dist/Brotli-0.4.0-py2.7-linux-x86_64.egg \
    $UNITY_PATH/Editor/Data/PlaybackEngines/WebGLSupport/BuildTools/Brotli/dist/Brotli-0.4.0-py2.7-macosx-10.10-x86_64.egg
