ARG baseImage="unityci/base:windows-latest"

FROM $baseImage

# Install unity hub
RUN powershell -Command `
  $ErrorActionPreference = 'Stop'; `
  $installer = 'C:\UnityHubSetup-x64.exe'; `
  Invoke-WebRequest -Uri 'https://public-cdn.cloud.unity3d.com/hub/prod/UnityHubSetup-x64.exe' -OutFile $installer; `
  Start-Process -FilePath $installer -ArgumentList '/S' -Wait; `
  Remove-Item $installer -Force
