########################
#    General Helpers   #
########################

function CheckLastExitCode {
  param ([int[]]$SuccessCodes = @(0), [scriptblock]$CleanupScript=$null)

  if ($SuccessCodes -notcontains $LastExitCode) {
    if ($CleanupScript) {
      "Executing cleanup script: $CleanupScript"
      &$CleanupScript
    }
    $msg = @"
EXE RETURNED EXIT CODE $LastExitCode
CALLSTACK:$(Get-PSCallStack | Out-String)
"@
    throw $msg
  }
}

########################
# Unity Module Helpers #
########################

function Get-ModuleDestinationPath {

  param (
    $ModuleList,
    $ModuleID,
    $UnityPath
  )
  $index=$ModuleList.FindIndex( {$args[0].id.contains($ModuleID)} )
  $rawPath=$ModuleList[$index].destination

  if ($null -eq $rawPath) {
    throw "Unable to get a destination path for $ModuleID"
  }

  return $rawPath.Replace('{UNITY_PATH}', $UnityPath)
}

function Get-ModuleRenamedPath {

param (
  $ModuleList,
  $ModuleID,
  $UnityPath
)
$index=$ModuleList.FindIndex( {$args[0].id.contains($ModuleID)} )
$rawPath=$ModuleList[$index].extractedPathRename.to

if ($null -eq $rawPath) {
  $rawPath=$ModuleList[$index].renameTo
  if ($null -eq $rawPath) {
    throw "Unable to get a ModuleRenamedPath for $ModuleID"
  }
}

return $rawPath.Replace('{UNITY_PATH}', $UnityPath)
}

function Find-Module {

  param (
      $ModuleList,
      $ModuleID
  )
  $index=$ModuleList.FindIndex( {$args[0].id.contains($ModuleID)} )
  return $index -ne -1
}
