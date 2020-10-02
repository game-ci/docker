###########################
#         Builder         #
###########################

FROM hub AS builder

ARG version="2020.1.4f1"
ARG changeset="fa717bb873ec"
ARG module="android"

# Install editor
RUN unity-hub install --version "$version" --changeset "$changeset"

# Install modules for that editor
RUN unity-hub install-modules --version "$version" --module "$module" --childModules

###########################
#          Editor         #
###########################

FROM base

ARG version="2020.1.4f1"

COPY --from=builder /opt/unity/editors/$version/ /opt/unity/editor/
