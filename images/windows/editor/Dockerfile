ARG baseImage="unityci/base:windows-latest"
ARG hubImage="unityci/hub:windows-latest"

#############
#  Builder  #
#############

FROM $hubImage AS Builder

# Using bash to process unity install
RUN choco install git --no-progress -y

SHELL ["cmd", "/S", "/C"]

RUN setx path "C:\\Program Files\\Git\\bin;%path%"

SHELL ["bash.exe", "-c"]

# Install Editor
# The portion after the & is to change the exit code to 0 if we exited 1 from
# the installation. Otherwise docker believes there was an error
ARG version
ARG changeSet

RUN "mkdir -p /var/log && mkdir -p C:/UnityEditor"

RUN "C:/Program\ Files/Unity\ Hub/Unity\ Hub.exe -- --headless install-path --set C:/UnityEditor"

RUN "C:/Program\ Files/Unity\ Hub/Unity\ Hub.exe -- --headless install \
                                                    --version $version \
                                                    --changeset $changeSet \
                                                    | tee /var/log/install-editor.log \
                                                    && grep 'Error' /var/log/install-editor.log \
                                                    | exit $(wc -l)"

ARG module
RUN "if [ $module = 'base' ]; then \
        echo 'running default modules for this base OS'; \
     else \
        C:/Program\ Files/Unity\ Hub/Unity\ Hub.exe -- --headless install-modules \
                                                    --version $version \
                                                    --module $module \
                                                    --childModules \
                                                    | tee /var/log/install-module-${module}.log \
                                                    && grep 'Missing module' /var/log/install-module-${module}.log \
                                                    | exit $(wc -l); \
     fi"

############
#  Editor  #
############

FROM $baseImage

SHELL ["powershell.exe", "-Command"]

# Copy the editor from the builder to the final editor image
COPY --from=Builder ["C:/UnityEditor/", "C:/UnityEditor/"]

# Need to grab these dependencies that the editor needs to run
COPY --from=Builder C:/windows/system32/MSVCP100.dll \
                    C:/windows/system32/MSVCP120.dll \
                    C:/windows/system32/MSVCR100.dll \
                    C:/windows/system32/MSVCR120.dll \
                    C:/windows/system32/

# Add version to file at editor path
ARG version
RUN echo "$Env:version" > "C:/UnityEditor/$Env:version/version"

RUN setx -M UNITY_PATH "C:/UnityEditor/$Env:version"

# Packages/manifest.json could have git dependencies
RUN choco install git --no-progress -y

# Unity package manager throws an error about not being in a git directory when
# importing git packages without this
RUN git config --global --add safe.directory "*"

# Need to enable these services to make Unity happy
# When these were in base, things blew up, not sure why they have to be specifically here
RUN foreach ("$service" in 'nlasvc', 'netprofm') {"Set-Service $service -StartupType Automatic"}

# Not needed with the dotnet base image
# RUN powershell -Command Set-Service 'wmiApSrv' -StartupType Automatic

ADD scripts ./scripts

ARG module
RUN if ("$Env:module" -eq 'Android') { .\scripts\SetupAndroid.ps1 }

# Accept Android Licenses. Needs to be separate from the above script to
# ensure the environment variables are set.
RUN if ("$Env:module" -eq 'Android') { .\scripts\AcceptAndroidLicenses.ps1 }

RUN Remove-Item .\scripts -Recurse -Force
