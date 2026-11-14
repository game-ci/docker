ARG baseImage="unityci/base:windows-latest"

FROM $baseImage

# Install a pinned Unity Hub.
# Unity Hub 3.18.0 and later crash on every --headless command inside Windows containers
# (stack overflow 0xC00000FD, access violation or breakpoint), which breaks every editor install.
# Older Chocolatey packages download an unversioned installer and fail their checksum,
# so the installer comes straight from Unity's CDN and is verified here.
ARG hubVersion="3.17.2"
ARG hubSha256="7f0498cd13ac22c974fdba3cc116dd42cd09267c9fdba7d05ec851f595cf6bdb"

SHELL ["powershell", "-NoProfile", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

RUN $installer = 'C:\UnityHubSetup.exe'; \
    $url = \"https://public-cdn.cloud.unity3d.com/hub/prod/$env:hubVersion/UnityHubSetup-$env:hubVersion-x64.exe\"; \
    Write-Host \"Downloading Unity Hub $env:hubVersion from $url\"; \
    Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $installer; \
    $actualSha256 = (Get-FileHash $installer -Algorithm SHA256).Hash; \
    if ($actualSha256 -ne $env:hubSha256) { throw \"Unity Hub installer checksum mismatch: expected $env:hubSha256, got $actualSha256\" }; \
    $installation = Start-Process $installer -ArgumentList '/S' -Wait -PassThru; \
    if ($installation.ExitCode -ne 0) { throw \"Unity Hub installer exited with code $($installation.ExitCode)\" }; \
    Remove-Item $installer; \
    $hub = 'C:\Program Files\Unity Hub\Unity Hub.exe'; \
    if (-not (Test-Path $hub)) { throw 'Unity Hub was not installed' }; \
    $installedVersion = (Get-Item $hub).VersionInfo.ProductVersion; \
    if (-not $installedVersion.StartsWith($env:hubVersion)) { throw \"Installed Unity Hub $installedVersion, expected $env:hubVersion\" }; \
    Write-Host \"Installed Unity Hub $installedVersion\"

SHELL ["cmd", "/S", "/C"]
