require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 194:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isSupportedMacModule = exports.isSupportedLinuxModule = exports.isSupportedWindowsModule = void 0;
const module_handler_1 = __nccwpck_require__(88);
const two_way_map_1 = __nccwpck_require__(648);
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
const renamedLinuxModules = new two_way_map_1.TwoWayMap(new Map());
const renamedWindowsModules = new two_way_map_1.TwoWayMap(new Map([['uwp-il2cpp', 'universal-windows-platform']]));
const renamedMacModules = new two_way_map_1.TwoWayMap(new Map());
const isSupportedWindowsModule = async (editorVersion, editorChangeset, module) => {
    const windowsModules = await (0, module_handler_1.getModules)(editorVersion, editorChangeset, 'win');
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
    const compatibleWindowsModules = (0, module_handler_1.filterIncompatibleModules)(editorVersion, windowsModules, incompatibleWindowsModules);
    // Add on base to the requested modules and put into a set to ensure no duplicates
    const moduleSet = new Set([...compatibleWindowsModules, 'base']);
    // Return whether the module is supported and what the real name is for the module
    return [moduleSet.has(module), realWindowsModuleName];
};
exports.isSupportedWindowsModule = isSupportedWindowsModule;
const isSupportedLinuxModule = async (editorVersion, editorChangeset, module) => {
    const linuxModules = await (0, module_handler_1.getModules)(editorVersion, editorChangeset, 'linux');
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
    const compatibleLinuxModules = (0, module_handler_1.filterIncompatibleModules)(editorVersion, linuxModules, incompatibleLinuxModules);
    //Add on base to the requested modules and put into a set to ensure no duplicates
    const moduleSet = new Set([...compatibleLinuxModules, 'base']);
    // Return whether the module is supported and what the real name is for the module
    return [moduleSet.has(module), realLinuxModuleName];
};
exports.isSupportedLinuxModule = isSupportedLinuxModule;
const isSupportedMacModule = async (editorVersion, editorChangeset, module) => {
    const macModules = await (0, module_handler_1.getModules)(editorVersion, editorChangeset, 'osx');
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
    const compatibleMacModules = (0, module_handler_1.filterIncompatibleModules)(editorVersion, macModules, incompatibleMacModules);
    //Add on base to the requested modules and put into a set to ensure no duplicates
    const moduleSet = new Set([...compatibleMacModules, 'base']);
    // Return whether the module is supported and what the real name is for the module
    return [moduleSet.has(module), realMacModuleName];
};
exports.isSupportedMacModule = isSupportedMacModule;


/***/ }),

/***/ 20:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.compareVersions = void 0;
/**
 * Compares Unity Versions
 * Returns -1 if versionA is less than versionB
 * Returns 1 if versionA is greater than versionB
 * Returns 0 if the versions are identical
 */
function compareVersions(versionA, versionB) {
    const [majorA, minorA, patchAWithVersionType] = versionA.split('.');
    const [majorB, minorB, patchBWithVersionType] = versionB.split('.');
    // Removing the 'fX' part of the string
    const patchA = patchAWithVersionType.slice(0, patchAWithVersionType.length - 2);
    const patchB = patchBWithVersionType.slice(0, patchBWithVersionType.length - 2);
    // Get the release type (a, b, f)
    const releaseTypeA = patchAWithVersionType[patchAWithVersionType.length - 2];
    const releaseTypeB = patchBWithVersionType[patchBWithVersionType.length - 2];
    // Get the number after release type
    const releaseNumberA = patchAWithVersionType[patchAWithVersionType.length - 1];
    const releaseNumberB = patchBWithVersionType[patchBWithVersionType.length - 1];
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
    if (releaseTypeA > releaseTypeB) {
        return 1;
    }
    if (releaseTypeA < releaseTypeB) {
        return -1;
    }
    if (releaseNumberA > releaseNumberB) {
        return 1;
    }
    if (releaseNumberA < releaseNumberB) {
        return -1;
    }
    // All fields are identical
    return 0;
}
exports.compareVersions = compareVersions;


/***/ }),

/***/ 822:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__nccwpck_require__(186));
const check_module_compatibility_1 = __nccwpck_require__(194);
const action = async () => {
    // Take input from workflow
    const editorChangeset = core.getInput('editorChangeset', { required: true });
    const editorVersion = core.getInput('editorVersion', { required: true });
    const editorModule = core.getInput('editorModule', { required: true });
    switch (process.platform) {
        case 'win32':
            const [supportedWindowsModule, realWindowsModuleName] = await (0, check_module_compatibility_1.isSupportedWindowsModule)(editorVersion, editorChangeset, editorModule);
            if (supportedWindowsModule) {
                core.setOutput('shouldBuild', true);
                core.setOutput('moduleRealName', realWindowsModuleName);
            }
            else {
                core.setOutput('shouldBuild', false);
            }
            return;
        case 'linux':
            const [supportedLinuxModule, realLinuxModuleName] = await (0, check_module_compatibility_1.isSupportedLinuxModule)(editorVersion, editorChangeset, editorModule);
            if (supportedLinuxModule) {
                core.setOutput('shouldBuild', true);
                core.setOutput('moduleRealName', realLinuxModuleName);
            }
            else {
                core.setOutput('shouldBuild', false);
            }
            return;
        default:
            core.setFailed('Incompatible base OS');
            return;
    }
};
action().catch((err) => {
    core.setFailed(err);
});


/***/ }),

/***/ 88:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.filterIncompatibleModules = exports.getModules = void 0;
const compare_unity_versions_1 = __nccwpck_require__(20);
const reMatchUnityModuleNames = new RegExp(`\\[(.*?)\\]`, 'gm');
const UNITY_DOWNLOAD_API_URL = 'https://download.unity3d.com/download_unity/';
//Fetches all supported modules for a specific verion of unity on a given base platform
async function getModules(version, changeset, platform) {
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
exports.getModules = getModules;
/**
 * Filters out incompatible modules from a provided array of modules
 * Returns a list of compatible modules
 */
function filterIncompatibleModules(targetVersion, targetModules, incompatibleModules) {
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
                    return (0, compare_unity_versions_1.compareVersions)(targetVersion, filterVersion) === 0;
                }
                const [bottomBound, topBound] = versionRange;
                //Checking a range of versions with no bottom or top bound
                if (bottomBound === '') {
                    //When there is no bottom bound, the filter acts as top bound exclusive
                    //so it is only incompatible if the version is less than the top bound
                    return (0, compare_unity_versions_1.compareVersions)(targetVersion, topBound) < 0;
                }
                if (topBound === '') {
                    //When there is no top bound, the filter acts bottom bound inclusive
                    //so it is incompatible if it is greater than or equal to the bottom bound
                    return (0, compare_unity_versions_1.compareVersions)(targetVersion, bottomBound) > -1;
                }
                //Same filter behavior as above but chained together for a close bound filter
                return (0, compare_unity_versions_1.compareVersions)(targetVersion, bottomBound) > -1 && (0, compare_unity_versions_1.compareVersions)(targetVersion, topBound) < 0;
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
exports.filterIncompatibleModules = filterIncompatibleModules;


/***/ }),

/***/ 648:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TwoWayMap = void 0;
class TwoWayMap {
    constructor(map) {
        this.map = map;
        this.reverseMap = new Map();
        for (const key in map) {
            const value = map.get(key);
            this.reverseMap.set(key, value);
        }
    }
    get(key) {
        return this.map.get(key);
    }
    revGet(key) {
        return this.reverseMap.get(key);
    }
    has(key) {
        return this.map.has(key);
    }
    revHas(key) {
        return this.reverseMap.has(key);
    }
}
exports.TwoWayMap = TwoWayMap;


/***/ }),

/***/ 351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__nccwpck_require__(37));
const utils_1 = __nccwpck_require__(278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __nccwpck_require__(351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(278);
const os = __importStar(__nccwpck_require__(37));
const path = __importStar(__nccwpck_require__(17));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(147));
const os = __importStar(__nccwpck_require__(37));
const utils_1 = __nccwpck_require__(278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 278:
/***/ ((__unused_webpack_module, exports) => {


// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 37:
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ 17:
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(822);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map