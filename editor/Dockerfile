###########################
#         Builder         #
###########################

FROM hub AS builder

ARG version="2020.1.4f1"
ARG changeset="fa717bb873ec"
ARG module="android"

# Install
RUN unity-hub install --version $version --changeset $changeset --module $module --cm

###########################
#          Editor         #
###########################

FROM base

ARG version="2020.1.4f1"

COPY --from=builder /opt/unity/editors/ /opt/unity/
