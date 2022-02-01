const core = require('@actions/core');
import fetch from 'cross-fetch';

class TwoWayMap {
  constructor(map) {
     this.map = map;
     this.reverseMap = new Map();
     for(const key in map) {
        const value = map.get(key);
        this.reverseMap.set(key, value);
     }
  }
  get(key) { return this.map.get(key); }
  revGet(key) { return this.reverseMap.get(key); }
  has(key) { return this.map.has(key); }
  revHas(key) { return this.reverseMap.has(key); }
}

const reMatchUnityModuleNames = new RegExp(`\\[(.*?)\\]`, 'gm');

/**
 * Incompatible versions for different modules for different platforms
 * Format is a map with key module and value Array<string>
 * The array should contain filters for incompatible versions
 * You only have to specify incompatibility if the modules are only
 * incompatible with gameCI, modules that inherently aren't compatible
 * with an editor version are automatically filtered. The module names
 * should be the original names from Unity. For example you should use
 * uwp-il2cpp for appropriate versions, not just universal-windows-platform.
 *
 * Filter formats
 * - Singular version ie: '2019.3.10f1'
 * Indicates that specific version is not compatible.
 *
 * - Unbounded bottom range ie: '-2019.3.0f1'
 * Indicates all versions below the upper bound, but not including
 * the upper bound are incompatible. In this example, everything
 * below 2019.3.0f1 is considered incompatible but 2019.3.0f1 is
 * considered compatible
 *
 * - Unbounded upper range ie: '2019.3.0f1-'
 * Indicates all versions above the bottom bound, and including the
 * bottom bound are incompatible. In this example all versions above
 * 2019.3.0f1 are considered incompatible and 2019.3.0f1 is also
 * considered incompatible
 *
 * - Fully bounded range ie: '2019.3.0f1-2019.3.3f1'
 * Same rules as the unbounded versions. Anything above or equal to 2019.3.0f1
 * but less than but not equal to 2019.3.3f1 is considered incompatible
 */
const incompatibleLinuxModules = new Map([['android', ['-2019.3.0f1']]]); // We don't support Android images for Linux below 2019.3.0f1
const incompatibleWindowsModules = new Map();
const incompatibleMacModules = new Map();

 /**
  * Unity has renamed various modules over the course of updating the Editor.
  * For example uwp-il2cpp became universal-windows-platform. This TwoWayMap is designed
  * to allow us to map those renamed modules in a consistent way. The structure is
  * key: the original name, value: the mapped name.
  *
  * Example:
  * uwp-il2cpp was renamed to universal-windows-platform. We will standardize to
  * universal-windows-platform so the mapping will be uwp-il2cpp: universal-windows-platform.
  */
  const renamedLinuxModules = new TwoWayMap(new Map());
  const renamedWindowsModules = new TwoWayMap(new Map([['uwp-il2cpp', 'universal-windows-platform']]));
  const renamedMacModules = new TwoWayMap(new Map());

const UNITY_DOWNLOAD_API_URL = 'https://download.unity3d.com/download_unity/';

const isSupportedWindowsModule = async (editorVersion, editorChangeset, module) => {
  const windowsModules = await getModules(editorVersion, editorChangeset, 'win');
  let realWindowsModuleName = '';

  // Fix any renamed modules
  for (let i = 0; i < windowsModules.length; ++i) {
    if (renamedWindowsModules.has(windowsModules[i])) {
      // If the renamed module is the one we are checking, note its real name
      if (renamedWindowsModules.get(windowsModules[i]) === module) {
        realWindowsModuleName = windowsModules[i];
      }
      windowsModules[i] = renamedWindowsModules.get(windowsModules[i]);
    }
  }

  // No rename occurred
  if (realWindowsModuleName === '') {
    realWindowsModuleName = module;
  }

  const compatibleWindowsModules = filterIncompatibleModules(editorVersion, windowsModules, incompatibleWindowsModules);

  // Add on base to the requested modules and put into a set to ensure no duplicates
  const moduleSet = new Set([...compatibleWindowsModules, 'base']);

  // Return whether the module is supported and what the real name is for the module
  return [moduleSet.has(module), realWindowsModuleName];
}

const isSupportedLinuxModule = async (editorVersion, editorChangeset, module) => {
  const linuxModules = await getModules(editorVersion, editorChangeset, 'linux');

  let realLinuxModuleName = '';

  // Fix any renamed modules
  for (let i = 0; i < linuxModules.length; ++i) {
    if (renamedLinuxModules.has(linuxModules[i])) {
      // If the renamed module is the one we are checking, note its real name
      if (renamedLinuxModules.get(linuxModules[i]) === module) {
        realLinuxModuleName = linuxModules[i];
      }
      linuxModules[i] = renamedLinuxModules.get(linuxModules[i]);
    }
  }

  // No rename occurred
  if (realLinuxModuleName === '') {
    realLinuxModuleName = module;
  }

  const compatibleLinuxModules = filterIncompatibleModules(editorVersion, linuxModules, incompatibleLinuxModules);

  //Add on base to the requested modules and put into a set to ensure no duplicates
  const moduleSet = new Set([...compatibleLinuxModules, 'base']);

  // Return whether the module is supported and what the real name is for the module
  return [moduleSet.has(module), realLinuxModuleName];
}

const isSupportedMacModule = async (editorVersion, editorChangeset, module)=> {
  const macModules = await getModules(editorVersion, editorChangeset, 'osx');

  let realMacModuleName = '';

  // Fix any renamed modules
  for (let i = 0; i < macModules.length; ++i) {
    if (renamedMacModules.has(macModules[i])) {
      // If the renamed module is the one we are checking, note its real name
      if (renamedMacModules.get(macModules[i]) === module) {
        realMacModuleName = macModules[i];
      }
      macModules[i] = renamedMacModules.get(macModules[i]);
    }
  }

  // No rename occurred
  if (realMacModuleName === '') {
    realMacModuleName = module;
  }

  const compatibleMacModules = filterIncompatibleModules(editorVersion, macModules, incompatibleMacModules);

  //Add on base to the requested modules and put into a set to ensure no duplicates
  const moduleSet = new Set([...compatibleMacModules, 'base']);

  // Return whether the module is supported and what the real name is for the module
  return [moduleSet.has(module), realMacModuleName];
}

//Fetches all supported modules for a specific verion of unity on a given base platform
async function getModules(version, changeset, platform) {
  // Get the config file that details all modules available to the version
  const res = await fetch(`${UNITY_DOWNLOAD_API_URL}/${changeset}/unity-${version}-${platform}.ini`);

  if (res.status >= 400) {
      throw new Error("Bad response from Unity API");
  }

  const responseBody = await res.text();
  const moduleSet = new Array();

  // Pull out each module name using regex
  const reMatchedModules = responseBody.matchAll(reMatchUnityModuleNames);

  // Add names to a set that we return
  let module = reMatchedModules.next();
  while(!module.done) {
      moduleSet.push(module.value[1].toLowerCase());
      module = reMatchedModules.next();
  }
  return moduleSet;
}

/**
 * Compares Unity Versions
 * Returns -1 if versionA is less than versionB
 * Returns 1 if versionA is greater than versionB
 * Returns 0 if the versions are identical
 */
function compareVersions(versionA, versionB) {
  const [majorA, minorA, patchAWithVersionType] = versionA.split('.');
  const [majorB, minorB, patchBWithVersionType] = versionB.split('.');

  //Removing the 'fX' part of the string
  const patchA = patchAWithVersionType.slice(0, patchAWithVersionType.length-2);
  const patchB = patchBWithVersionType.slice(0, patchBWithVersionType.length-2);

  if (majorA > majorB) {
      return 1;
  }
  if (majorA < majorB) {
      return -1;
  }
  if (minorA > minorB) {
      return 1;
  }
  if (minorA < minorB) {
      return -1;
  }
  if (patchA > patchB) {
      return 1;
  }
  if (patchA < patchB) {
      return -1;
  }
  // All fields are identical
  return 0;
}

/**
 * Filters out incompatible modules from a provided array of modules
 * Returns a list of compatible modules
 */
function filterIncompatibleModules(targetVersion, targetModules,
                                   incompatibleModules) {
  let filteredModules = new Array();
  for (let i = 0; i < targetModules.length; ++i) {

      // We have versions that aren't compatible with this module
      if (incompatibleModules.has(targetModules[i])) {
          const incompatibleVersions = incompatibleModules.get(targetModules[i]);

          //Extract version filters that match this version
          const filteredVersions = incompatibleVersions?.filter(function (filterVersion) {
              const versionRange = filterVersion.split('-');

              //Check for a singular version filter (No range)
              if (versionRange.length === 1)
              {
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
      }
      else {
          //We have no incompatibilites with this module so we can just add it
          filteredModules.push(targetModules[i]);
      }
  }
  return filteredModules;
}

const action = async () => {
  // Take input from workflow
  const editorChangeset = core.getInput('editorChangeset', { required: true });
  const editorVersion = core.getInput('editorVersion', { required: true });
  const editorModule = core.getInput('editorModule', { required: true });

  switch(process.platform) {
    case 'win32':
      const [supportedWindowsModule, realWindowsModuleName] = await isSupportedWindowsModule(editorVersion, editorChangeset, editorModule);
      if (supportedWindowsModule) {
        core.setOutput('shouldBuild', true);
        core.setOutput('moduleRealName', realWindowsModuleName);
      } else {
        core.setOutput('shouldBuild', false);
      }
      return;
    case 'linux':
      const [supportedLinuxModule, realLinuxModuleName] = await isSupportedLinuxModule(editorVersion, editorChangeset, editorModule);
      if (supportedLinuxModule) {
        core.setOutput('shouldBuild', true);
        core.setOutput('moduleRealName', realLinuxModuleName);
      } else {
        core.setOutput('shouldBuild', false);
      }
      return;
    default:
      core.setFailed("Incompatible base OS");
      return;
  }
}

action().catch((err) => { core.setFailed(err) });
