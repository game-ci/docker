import { filterIncompatibleModules, getModules } from './module-handler';
import { TwoWayMap } from './two-way-map';

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
const incompatibleLinuxModules = new Map<string, Array<string>>([['android', ['-2019.3.0f1']]]); // We don't support Android images for Linux below 2019.3.0f1
const incompatibleWindowsModules = new Map<string, Array<string>>();
const incompatibleMacModules = new Map<string, Array<string>>();

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
const renamedLinuxModules = new TwoWayMap(new Map<string, string>());
const renamedWindowsModules = new TwoWayMap(new Map<string, string>([['uwp-il2cpp', 'universal-windows-platform']]));
const renamedMacModules = new TwoWayMap(new Map<string, string>());

export const isSupportedWindowsModule = async (editorVersion: string, editorChangeset: string, module: string) => {
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
};

export const isSupportedLinuxModule = async (editorVersion: string, editorChangeset: string, module: string) => {
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
};

export const isSupportedMacModule = async (editorVersion: string, editorChangeset: string, module: string) => {
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
};
