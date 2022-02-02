import * as core from '@actions/core';
import { isSupportedWindowsModule, isSupportedLinuxModule } from './check-module-compatibility';

const action = async () => {
  // Take input from workflow
  const editorChangeset = core.getInput('editorChangeset', { required: true });
  const editorVersion = core.getInput('editorVersion', { required: true });
  const editorModule = core.getInput('editorModule', { required: true });

  switch (process.platform) {
    case 'win32':
      const [supportedWindowsModule, realWindowsModuleName] = await isSupportedWindowsModule(
        editorVersion,
        editorChangeset,
        editorModule,
      );
      if (supportedWindowsModule) {
        core.setOutput('shouldBuild', true);
        core.setOutput('moduleRealName', realWindowsModuleName);
      } else {
        core.setOutput('shouldBuild', false);
      }
      return;
    case 'linux':
      const [supportedLinuxModule, realLinuxModuleName] = await isSupportedLinuxModule(
        editorVersion,
        editorChangeset,
        editorModule,
      );
      if (supportedLinuxModule) {
        core.setOutput('shouldBuild', true);
        core.setOutput('moduleRealName', realLinuxModuleName);
      } else {
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
