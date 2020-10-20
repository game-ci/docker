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
COPY --from=builder /opt/unity/editors/$version/ "$UNITY_PATH/"

# Add a file containing the version for this build
RUN echo $version > "$UNITY_PATH/version"

# Alias to "unity-editor" with default params
RUN echo '#!/bin/bash\nxvfb-run -ae /dev/stdout "$UNITY_PATH/Editor/Unity" -batchmode "$@"' > /usr/bin/unity-editor \
 && chmod +x /usr/bin/unity-editor
