$ErrorActionPreference = "Stop"

. scripts/HelperFunctions.ps1

# Read the modules.json file for the editor to figure out the proper paths dynamically
[void][System.Reflection.Assembly]::LoadWithPartialName("System.Web.Extensions")
$raw_modules = Get-Content "$Env:UNITY_PATH/modules.json"
$UNITY_MODULES_JSON = (New-Object -TypeName System.Web.Script.Serialization.JavaScriptSerializer -Property @{MaxJsonLength=67108864}).DeserializeObject($raw_modules)
$UNITY_MODULES_LIST = [Collections.Generic.List[Object]]($UNITY_MODULES_JSON)

# Find our environment variables
$ANDROID_SDK_ROOT = Get-ModuleDestinationPath $UNITY_MODULES_LIST 'android-sdk-platform-tools' $Env:UNITY_PATH
$ANDROID_NDK_HOME = Get-ModuleDestinationPath $UNITY_MODULES_LIST 'android-ndk' $Env:UNITY_PATH
$JAVA_HOME        = Get-ModuleDestinationPath $UNITY_MODULES_LIST 'android-open-jdk' $Env:UNITY_PATH

# Unity's release metadata installs OpenJDK 11 for every 2022.1 release, but its Android
# module only accepts JDK 8, so builds fail with "JDK not found".
if ($Env:version -match '^2022\.1\.')
{
  if ((Split-Path $JAVA_HOME -Leaf) -ne 'OpenJDK') { throw "Refusing to replace unexpected JDK path: $JAVA_HOME" }

  $archive = "$Env:TEMP\openjdk8.zip"
  Write-Host "Replacing OpenJDK at $JAVA_HOME with OpenJDK 8 from $Env:openJdk8Url"
  Invoke-WebRequest -UseBasicParsing -Uri $Env:openJdk8Url -OutFile $archive
  $actualSha256 = (Get-FileHash $archive -Algorithm SHA256).Hash
  if ($actualSha256 -ne $Env:openJdk8Sha256) { throw "OpenJDK 8 checksum mismatch: expected $Env:openJdk8Sha256, got $actualSha256" }

  Remove-Item $JAVA_HOME -Recurse -Force
  Expand-Archive -Path $archive -DestinationPath $JAVA_HOME
  Remove-Item $archive

  # Native stderr becomes an error record under 'Stop', so read the version under 'Continue'
  $ErrorActionPreference = 'Continue'
  $javaVersion = & "$JAVA_HOME/bin/java.exe" -version 2>&1 | Out-String
  $javaExitCode = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  Write-Host $javaVersion
  if ($javaExitCode -ne 0 -or $javaVersion -notmatch 'version "1\.8\.') { throw "OpenJDK 8 at $JAVA_HOME does not report Java 1.8 (exit code $javaExitCode)" }
  if (-not (Test-Path "$JAVA_HOME/bin/javac.exe")) { throw "javac.exe is missing from $JAVA_HOME" }
}

if (Find-Module $UNITY_MODULES_LIST 'android-sdk-command-line-tools')
{
  $TOOLS_PATH = Get-ModuleRenamedPath $UNITY_MODULES_LIST 'android-sdk-command-line-tools' $Env:UNITY_PATH
}
else
{
  $TOOLS_PATH = "$ANDROID_SDK_ROOT/tools"
}

# Set our environment variables
$newPath = "$JAVA_HOME/bin;$ANDROID_SDK_ROOT/tools;$TOOLS_PATH/bin;$ANDROID_SDK_ROOT/platform-tools;$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/windows-x86_64/bin;C:/Program Files/Git/bin"
$oldPath = [Environment]::GetEnvironmentVariable('PATH', 'Machine');

[Environment]::SetEnvironmentVariable('PATH',                  "$newPath;$oldPath", 'Machine');
[Environment]::SetEnvironmentVariable('ANDROID_HOME',          "$ANDROID_SDK_ROOT", 'Machine');
[Environment]::SetEnvironmentVariable('ANDROID_NDK_HOME',      "$ANDROID_NDK_HOME", 'Machine');
[Environment]::SetEnvironmentVariable('JAVA_HOME',             "$JAVA_HOME",        'Machine');
[Environment]::SetEnvironmentVariable('ANDROID_CMDLINE_TOOLS', "$TOOLS_PATH",       'Machine');

# Unity seems to always look for this file and can't find it so we manually create an empty one
New-Item -ItemType file -Path "$Env:USERPROFILE/.android/repositories.cfg" -Force
