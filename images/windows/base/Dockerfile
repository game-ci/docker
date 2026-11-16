ARG windowsDllSourceImage="mcr.microsoft.com/windows/server:ltsc2022"
ARG windowsImage="mcr.microsoft.com/dotnet/framework/sdk:4.8-windowsservercore-ltsc2022"

# Need this image to grab missing dlls for the server core version
FROM $windowsDllSourceImage AS dll-source

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

# Install chocolatey
RUN powershell -Command Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install the Visual C++ 2013 runtime (MSVCR120/MSVCP120), which the editor's tbb.dll links against.
# The checksum is the one in winget's Microsoft.VCRedist.2013.x64 manifest.
ARG vcRedist2013Url="https://download.visualstudio.microsoft.com/download/pr/10912041/cee5d6bca2ddbcd039da727bf4acb48a/vcredist_x64.exe"
ARG vcRedist2013Sha256="a4bba7701e355ae29c403431f871a537897c363e215cafe706615e270984f17c"

SHELL ["powershell", "-NoProfile", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

RUN $installer = 'C:\vcredist2013_x64.exe'; \
    Invoke-WebRequest -UseBasicParsing -Uri $env:vcRedist2013Url -OutFile $installer; \
    $actualSha256 = (Get-FileHash $installer -Algorithm SHA256).Hash; \
    if ($actualSha256 -ne $env:vcRedist2013Sha256) { throw \"VC++ 2013 installer checksum mismatch: expected $env:vcRedist2013Sha256, got $actualSha256\" }; \
    $installation = Start-Process $installer -ArgumentList '/install', '/quiet', '/norestart' -Wait -PassThru; \
    if ($installation.ExitCode -notin 0, 3010) { throw \"VC++ 2013 installer exited with code $($installation.ExitCode)\" }; \
    Remove-Item $installer; \
    foreach ($dll in 'msvcr120.dll', 'msvcp120.dll') { if (-not (Test-Path \"C:\Windows\System32\$dll\")) { throw \"$dll is missing after installing VC++ 2013\" } }; \
    Write-Host 'Installed the Visual C++ 2013 runtime'

SHELL ["cmd", "/C"]
