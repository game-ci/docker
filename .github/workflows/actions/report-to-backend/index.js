const core = require('@actions/core');
const { post } = require('httpie');

const startedEndpoint = 'https://europe-west3-unity-ci-versions.cloudfunctions.net/reportNewBuild';
const failedEndpoint = 'https://europe-west3-unity-ci-versions.cloudfunctions.net/reportBuildFailure';
const publishedEndpoint = 'https://europe-west3-unity-ci-versions.cloudfunctions.net/reportPublication';

const action = async () => {
  // Take input from workflow
  const token = core.getInput('token', { required: true });
  const jobIdInput = core.getInput('jobId', { required: true });
  const status = core.getInput('status', { required: true });
  const imageType = core.getInput('imageType', { required: true });
  const baseOs = core.getInput('baseOs', { required: true });
  const repoVersion = core.getInput('repoVersion', { required: true });
  const editorVersion = core.getInput('editorVersion', { required: false }) || 'none';
  const targetPlatform = core.getInput('targetPlatform', { required: false }) || 'none';

  const isDryRun = jobIdInput === 'dryRun';

  // Determine job for dryRun automatically
  let jobId = jobIdInput
  if (isDryRun) {
    jobId += `-${imageType}`
    if (imageType === 'editor') { jobId += `-${editorVersion}` }
    jobId += `-${repoVersion}`
  }

  // Determine identifier for this build
  let buildId = '';
  if (isDryRun) { buildId += `dryRun-` }
  buildId += `${imageType}-${baseOs}`
  if (imageType === 'editor') { buildId += `-${editorVersion}-${targetPlatform}` }
  buildId += `-${repoVersion}`

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Handle each status
  if (status === 'started') {
    try {
      const body = {
        jobId,
        buildId,
        imageType,
        baseOs,
        repoVersion,
        editorVersion,
        targetPlatform,
      }

      const { statusCode, data } = await post(startedEndpoint, { headers, body });
      console.log('Reported that this build has started.', statusCode, data);
    } catch (err) {
      console.error('An error occurred while reporting the start of this build.', err.statusCode, err.message);
      console.error('~> data:', err.data);
      core.setFailed(err)
    }

    return;
  }

  if (status === 'failed') {
    try {
      const reason = core.getInput('reason', { required: true });

      const body = {
        jobId,
        buildId,
        reason,
      }

      const { statusCode, data } = await post(failedEndpoint, { headers, body });
      console.log('Successfully reported the build failure.', statusCode, data);
    } catch (err) {
      console.error('An error occurred while reporting the build failure.', err.statusCode, err.message);
      console.error('~> data:', err.data);
      core.setFailed(err)
    }

    return;
  }

  if (status === 'published') {
    try {
      const imageRepo = core.getInput('imageRepo', { required: true });
      const imageName = core.getInput('imageName', { required: true });
      const friendlyTag = core.getInput('friendlyTag', { required: true });
      const specificTag = core.getInput('specificTag', { required: true });
      const digest = core.getInput('digest', { required: true });

      const body = {
        jobId,
        buildId,
        dockerInfo: {
          imageRepo,
          imageName,
          friendlyTag,
          specificTag,
          digest,
        }
      }

      const { statusCode, data } = await post(publishedEndpoint, { headers, body });
      console.log('Successfully reported this publication.', statusCode, data);
    } catch (err) {
      console.error('An error occurred while reporting this publication.', err.statusCode, err.message);
      console.error('~> data:', err.data);
      core.setFailed(err)
    }

    return;
  }

  throw new Error('Invalid status was given, so no action was taken.');
}

action().catch((err) => { core.setFailed(err) });
