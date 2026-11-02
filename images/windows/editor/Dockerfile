ARG baseImage="unityci/base:windows-latest"
ARG hubImage="unityci/hub:windows-latest"

# Git for Windows, pinned and verified: Chocolatey exits 0 when its feed is unreachable,
# which cached layers without Git. https://github.com/git-for-windows/git/releases
ARG gitReleaseTag="v2.56.0.windows.4"
ARG gitInstaller="Git-2.56.0.4-64-bit.exe"
ARG gitSha256="4961a4a8cc778d8b6e00a5819e5fe4d078b754555aff7aedc2d77a5d74c2de80"

#############
#  Builder  #
#############

FROM $hubImage AS Builder

# Using bash to process unity install
ARG gitReleaseTag
ARG gitInstaller
ARG gitSha256

SHELL ["powershell", "-NoProfile", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

RUN $installer = 'C:\GitSetup.exe'; \
    $url = \"https://github.com/git-for-windows/git/releases/download/$env:gitReleaseTag/$env:gitInstaller\"; \
    Write-Host \"Downloading Git for Windows from $url\"; \
    Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $installer; \
    $actualSha256 = (Get-FileHash $installer -Algorithm SHA256).Hash; \
    if ($actualSha256 -ne $env:gitSha256) { throw \"Git installer checksum mismatch: expected $env:gitSha256, got $actualSha256\" }; \
    $installation = Start-Process $installer -ArgumentList '/VERYSILENT', '/NORESTART', '/NOCANCEL', '/SP-', '/SUPPRESSMSGBOXES' -Wait -PassThru; \
    if ($installation.ExitCode -ne 0) { throw \"Git installer exited with code $($installation.ExitCode)\" }; \
    Remove-Item $installer; \
    foreach ($tool in 'C:\Program Files\Git\cmd\git.exe', 'C:\Program Files\Git\bin\bash.exe') { if (-not (Test-Path $tool)) { throw \"$tool is missing after installing Git\" } }; \
    & 'C:\Program Files\Git\cmd\git.exe' --version; \
    if ($LASTEXITCODE -ne 0) { throw 'git --version failed' }

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
                    C:/windows/system32/MSVCR100.dll \
                    C:/windows/system32/

# Add version to file at editor path
ARG version
RUN echo "$Env:version" > "C:/UnityEditor/$Env:version/version"

RUN setx -M UNITY_PATH "C:/UnityEditor/$Env:version"

# Packages/manifest.json could have git dependencies
ARG gitReleaseTag
ARG gitInstaller
ARG gitSha256

SHELL ["powershell", "-NoProfile", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

RUN $installer = 'C:\GitSetup.exe'; \
    $url = \"https://github.com/git-for-windows/git/releases/download/$env:gitReleaseTag/$env:gitInstaller\"; \
    Write-Host \"Downloading Git for Windows from $url\"; \
    Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $installer; \
    $actualSha256 = (Get-FileHash $installer -Algorithm SHA256).Hash; \
    if ($actualSha256 -ne $env:gitSha256) { throw \"Git installer checksum mismatch: expected $env:gitSha256, got $actualSha256\" }; \
    $installation = Start-Process $installer -ArgumentList '/VERYSILENT', '/NORESTART', '/NOCANCEL', '/SP-', '/SUPPRESSMSGBOXES' -Wait -PassThru; \
    if ($installation.ExitCode -ne 0) { throw \"Git installer exited with code $($installation.ExitCode)\" }; \
    Remove-Item $installer; \
    foreach ($tool in 'C:\Program Files\Git\cmd\git.exe', 'C:\Program Files\Git\bin\bash.exe') { if (-not (Test-Path $tool)) { throw \"$tool is missing after installing Git\" } }; \
    & 'C:\Program Files\Git\cmd\git.exe' --version; \
    if ($LASTEXITCODE -ne 0) { throw 'git --version failed' }

SHELL ["powershell.exe", "-Command"]

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
