ARG baseImage="unityci/base:windows-latest"
ARG hubImage="unityci/hub:windows-latest"

#############
#  Builder  #
#############

FROM $hubImage as Builder

# Install Editor
# The portion after the & is to change the exit code to 0 if we exited 1 from
# the installation. Otherwise docker believes there was an error
# TODO: This isn't quite on parity with the linux side. Ideally we install the
# editor first, then add modules, however it doesn't appear that the --add-modules
# command works on windows so we have to install the module when installing the
# editor
ARG version
ARG changeSet
ARG module
RUN IF %module% == "base" ( \
    "C:/Program Files/Unity Hub/Unity Hub.exe" -- --headless install \
                                               --version %version% \
                                               --changeset %changeSet% \
                                               & if %ERRORLEVEL% EQU 1 exit 0

ARG module
RUN IF NOT %module% == "base" ( \
    "C:/Program Files/Unity Hub/Unity Hub.exe" -- --headless install-modules \
                                               --version %version% \
                                               --module %module% \
                                               --childModules \
                                               & if %ERRORLEVEL% EQU 1 exit 0 \
    )

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

# Need to enable these services to make Unity happy
# When these were in base, things blew up, not sure why they have to be specifically here
RUN powershell -Command foreach ($service in 'nlasvc', 'netprofm') {"Set-Service $service -StartupType Automatic"}

# Not needed with the dotnet base image
# RUN powershell -Command Set-Service 'wmiApSrv' -StartupType Automatic
