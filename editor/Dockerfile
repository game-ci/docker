ARG hubImage="unityci/hub"
ARG baseImage="unityci/base"
ARG version="2020.1.4f1"

###########################
#         Builder         #
###########################

FROM $hubImage AS builder

# Install editor
ARG changeset="fa717bb873ec"
RUN unity-hub install --version "$version" --changeset "$changeset"

# Install modules for that editor
ARG module="android"
RUN unity-hub install-modules --version "$version" --module "$module" --childModules | grep 'Missing module' | exit $(wc -l)

###########################
#          Editor         #
###########################

FROM $baseImage

# Always put "Editor" and "modules.json" directly in $UNITY_PATH
COPY --from=builder /opt/unity/editors/$version/ "$UNITY_PATH/"

# Add a file containing the version for this build
RUN echo $version > "$UNITY_PATH/version"

# Alias to "editor" or "unity" with default params
RUN echo '#!/bin/bash\nxvfb-run -ae /dev/stdout "$UNITY_PATH/Editor/Unity" -batchmode "$@"' > /usr/bin/editor \
 && chmod +x /usr/bin/editor \
 && ln -s /usr/bin/editor /usr/bin/unity
