ARG baseImage="unityci/base:windows-latest"

FROM $baseImage

# Install Unity Hub directly from Unity CDN (chocolatey unity-hub package CDN URL returns 404)
RUN powershell -NoLogo -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri 'https://public-cdn.cloud.unity3d.com/hub/prod/UnityHubSetup.exe' -OutFile 'C:\UnityHubSetup.exe'; Start-Process -FilePath 'C:\UnityHubSetup.exe' -ArgumentList '/S' -Wait; Remove-Item 'C:\UnityHubSetup.exe' -Force"
