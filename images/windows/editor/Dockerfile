ARG baseImage="unityci/base:windows-latest"
ARG hubImage="unityci/hub:windows-latest"

#############
#  Builder  #
#############

FROM $hubImage as Builder

# Packages/manifest.json could have git dependencies
RUN choco install git --no-progress -y

SHELL ["cmd", "/S", "/C"]

RUN setx path "C:\\Program Files\\Git\\bin;%path%"

SHELL ["bash.exe", "-c"]

# Install Editor
# The portion after the & is to change the exit code to 0 if we exited 1 from
# the installation. Otherwise docker believes there was an error
ARG version
ARG changeSet
RUN "mkdir -p /var/log"
RUN "C:/Program\ Files/Unity\ Hub/Unity\ Hub.exe -- --headless install \
                                                    --version $version \
                                                    --changeset $changeSet \
                                                    | tee /var/log/install-editor.log \
                                                    && grep 'Error' /var/log/install-editor.log \
                                                    | exit $(wc -l)"

# ARG module
RUN "C:/Program\ Files/Unity\ Hub/Unity\ Hub.exe -- --headless install-modules \
                                                    --version $version \
                                                    --module $module \
                                                    --childModules \
                                                    | tee /var/log/install-module-${module}.log \
                                                    && grep 'Missing module' /var/log/install-module-${module}.log \
                                                    | exit $(wc -l);

############
#  Editor  #
############

FROM $baseImage

# Copy the editor from the builder to the final editor image
COPY --from=Builder ["C:/Program Files/Unity/Hub/Editor/", "C:/Program Files/Unity/Hub/Editor/"]

# Need to grab these dependencies that the editor needs to run
COPY --from=Builder C:/windows/system32/MSVCP100.dll \
                    C:/windows/system32/MSVCP120.dll \
                    C:/windows/system32/MSVCR100.dll \
                    C:/windows/system32/MSVCR120.dll \
                    C:/windows/system32/

# Add version to file at editor path
ARG version
RUN echo %version% > "C:/Program Files/Unity/Hub/Editor/%version%/version"

SHELL ["powershell.exe", "-Command"]

RUN setx -M UNITY_PATH "C:/Program` Files/Unity/Hub/Editor/$Env:version"

# Need to enable these services to make Unity happy
# When these were in base, things blew up, not sure why they have to be specifically here
RUN powershell -Command foreach ($service in 'nlasvc', 'netprofm') {"Set-Service $service -StartupType Automatic"}

# Not needed with the dotnet base image
# RUN powershell -Command Set-Service 'wmiApSrv' -StartupType Automatic

ADD SetupSDKManager.ps1 SetupAndroidPaths.ps1 ./

RUN powershell -Command .\SetupAndroidPaths.ps1

COPY ["licenses/", "C:/licenses/"]

RUN powershell -Command .\SetupSDKManager.ps1

RUN rm *.ps1
