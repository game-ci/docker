ARG windowsDllSourceImage="mcr.microsoft.com/windows:1809"
ARG windowsImage="mcr.microsoft.com/dotnet/framework/sdk:4.8-windowsservercore-ltsc2019"

# Need this image to grab missing dlls for the server core version
FROM $windowsDllSourceImage as dll-source

# We use the .net framework servercore image because we will need the .net support
# anyway and there is no real benefit to try and make this smaller by
# basing on the blank windowsservercore because only the .net version is
# cached on the github actions runner. 
FROM $windowsImage

SHELL ["cmd", "/C"]

# DLLs for Unity Hub and Unity Editor
COPY --from=dll-source c:/windows/system32/BluetoothApis.dll \
                       c:/windows/system32/bthprops.cpl \
                       c:/windows/system32/dxva2.dll \
                       c:/windows/system32/mf.dll \
                       c:/windows/system32/mfplat.dll \
                       c:/windows/system32/mfreadwrite.dll \
                       c:/windows/system32/opengl32.dll \
                       c:/windows/system32/glu32.dll \
                       c:/windows/system32/

# Enable executing powershell scripts
RUN powershell -Command Set-ExecutionPolicy unrestricted
