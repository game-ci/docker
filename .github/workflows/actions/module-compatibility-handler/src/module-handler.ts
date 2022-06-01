import { compareVersions } from './compare-unity-versions';

const reMatchUnityModuleNames = new RegExp(`\\[(.*?)\\]`, 'gm');

const UNITY_DOWNLOAD_API_URL = 'https://download.unity3d.com/download_unity/';

//Fetches all supported modules for a specific verion of unity on a given base platform
export async function getModules(version: string, changeset: string, platform: string) {
  // Get the config file that details all modules available to the version
  const res = await fetch(`${UNITY_DOWNLOAD_API_URL}/${changeset}/unity-${version}-${platform}.ini`);

  if (res.status >= 400) {
    throw new Error('Bad response from Unity API');
  }

  const responseBody = await res.text();
  const moduleSet = new Array();

  // Pull out each module name using regex
  const reMatchedModules = responseBody.matchAll(reMatchUnityModuleNames);

  // Add names to a set that we return
  let module = reMatchedModules.next();
  while (!module.done) {
    moduleSet.push(module.value[1].toLowerCase());
    module = reMatchedModules.next();
  }
  return moduleSet;
}

/**
 * Filters out incompatible modules from a provided array of modules
 * Returns a list of compatible modules
 */
export function filterIncompatibleModules(
  targetVersion: string,
  targetModules: Array<string>,
  incompatibleModules: Map<string, Array<string>>,
) {
  let filteredModules = new Array();
  for (let i = 0; i < targetModules.length; ++i) {
    // We have versions that aren't compatible with this module
    if (incompatibleModules.has(targetModules[i])) {
      const incompatibleVersions = incompatibleModules.get(targetModules[i]);

      //Extract version filters that match this version
      const filteredVersions = incompatibleVersions?.filter(function (filterVersion) {
        const versionRange = filterVersion.split('-');

        //Check for a singular version filter (No range)
        if (versionRange.length === 1) {
          // In singular version filters, an exact match means they are incompatible
          return compareVersions(targetVersion, filterVersion) === 0;
        }

        const [bottomBound, topBound] = versionRange;

        //Checking a range of versions with no bottom or top bound
        if (bottomBound === '') {
          //When there is no bottom bound, the filter acts as top bound exclusive
          //so it is only incompatible if the version is less than the top bound
          return compareVersions(targetVersion, topBound) < 0;
        }
        if (topBound === '') {
          //When there is no top bound, the filter acts bottom bound inclusive
          //so it is incompatible if it is greater than or equal to the bottom bound
          return compareVersions(targetVersion, bottomBound) > -1;
        }

        //Same filter behavior as above but chained together for a close bound filter
        return compareVersions(targetVersion, bottomBound) > -1 && compareVersions(targetVersion, topBound) < 0;
      });

      //If no filters flagged the target version, the module is compatible
      if (filteredVersions?.length === 0) {
        filteredModules.push(targetModules[i]);
      }
    } else {
      //We have no incompatibilites with this module so we can just add it
      filteredModules.push(targetModules[i]);
    }
  }
  return filteredModules;
}
