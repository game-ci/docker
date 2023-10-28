function Get-Module-Destination-Path {

    param (
        $ModuleList,
        $ModuleID
    )
    $index=$ModuleList.FindIndex( {$args[0].id.contains($ModuleID)} )
    $rawPath=$ModuleList[$index].destination
    return $rawPath.Replace('{UNITY_PATH}', $Env:UNITY_PATH)
}

function Get-Module-Renamed-Path {

  param (
      $ModuleList,
      $ModuleID
  )
  $index=$ModuleList.FindIndex( {$args[0].id.contains($ModuleID)} )
  $rawPath=$ModuleList[$index].extractedPathRename.to
  return $rawPath.Replace('{UNITY_PATH}', $Env:UNITY_PATH)
}

function Module-Exists {

    param (
        $ModuleList,
        $ModuleID
    )
    $index=$ModuleList.FindIndex( {$args[0].id.contains($ModuleID)} )
    return $index -ne -1
}

# Read the modules.json file for the editor to figure out the proper paths dynamically
[void][System.Reflection.Assembly]::LoadWithPartialName("System.Web.Extensions")
$raw_modules = Get-Content "$Env:UNITY_PATH/modules.json"
$UNITY_MODULES_JSON = (New-Object -TypeName System.Web.Script.Serialization.JavaScriptSerializer -Property @{MaxJsonLength=67108864}).DeserializeObject($raw_modules)
$UNITY_MODULES_LIST = [Collections.Generic.List[Object]]($UNITY_MODULES_JSON)

# Find our environment variables
$ANDROID_SDK_ROOT = Get-Module-Destination-Path $UNITY_MODULES_LIST 'android-sdk-platform-tools'
$ANDROID_NDK_HOME = Get-Module-Destination-Path $UNITY_MODULES_LIST 'android-ndk'
$JAVA_HOME = Get-Module-Destination-Path $UNITY_MODULES_LIST 'android-open-jdk'

if (Module-Exists $UNITY_MODULES_LIST 'android-sdk-command-line-tools')
{
  $TOOLS_PATH = Get-Module-Renamed-Path $UNITY_MODULES_LIST 'android-sdk-command-line-tools'
}
else
{
  $TOOLS_PATH = "$ANDROID_SDK_ROOT/tools"
}

# Set our environment variables
$newPath = "$JAVA_HOME/bin;$ANDROID_SDK_ROOT/tools;$TOOLS_PATH/bin;$ANDROID_SDK_ROOT/platform-tools;$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/windows-x86_64/bin;C:/Program Files/Git/bin"
$oldPath = [Environment]::GetEnvironmentVariable('PATH', 'Machine');
[Environment]::SetEnvironmentVariable('PATH', "$newPath;$oldPath",'Machine');
[Environment]::SetEnvironmentVariable('ANDROID_HOME', $ANDROID_SDK_ROOT,'Machine');
[Environment]::SetEnvironmentVariable('ANDROID_NDK_HOME', $ANDROID_NDK_HOME,'Machine');
[Environment]::SetEnvironmentVariable('JAVA_HOME', $JAVA_HOME,'Machine');
[Environment]::SetEnvironmentVariable('ANDROID_CMDLINE_TOOLS', $TOOLS_PATH,'Machine');
