$ErrorActionPreference = "Stop"

. scripts/HelperFunctions.ps1

# Accept Android Licenses
Set-Location "$Env:ANDROID_CMDLINE_TOOLS/bin"
bash -c "yes | ./sdkmanager.bat --licenses"
CheckLastExitCode
