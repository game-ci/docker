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

# Alias to "unity-editor" with default params
RUN { \
    echo '#!/bin/bash'; \
    echo ''; \
    \
    [ `echo $version-$module | grep -e '^2019.3.*-linux-il2cpp'` ] \
        && echo '# [2019.3.x-linux-il2cpp] https://forum.unity.com/threads/unity-2019-3-linux-il2cpp-player-can-only-be-built-with-linux-error.822210/#post-5633977' \
        && echo 'export IL2CPP_ADDITIONAL_ARGS="--sysroot-path=/ --tool-chain-path=/"' \
        && echo ''; \
    \
    echo 'xvfb-run -ae /dev/stdout "$UNITY_PATH/Editor/Unity" -batchmode "$@"'; \
  } > /usr/bin/unity-editor \
  && chmod +x /usr/bin/unity-editor

###########################
#       Extra steps       #
###########################

#=======================================================================================
# [webgl, il2cpp] python build-essential clang
#=======================================================================================
RUN [ `echo $module | grep -v '\(webgl\|linux-il2cpp\)'` ] && exit 0 || : \
  && apt-get -q update \
  && apt-get -q install -y --no-install-recommends --allow-downgrades \
    python \
    build-essential \
    clang \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
