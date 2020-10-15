const core = require('@actions/core');
const { post } = require('httpie');

const startedEndpoint = 'https://europe-west3-unity-ci-versions.cloudfunctions.net/buildQueue-reportNewBuild';
const failedEndpoint = 'https://europe-west3-unity-ci-versions.cloudfunctions.net/buildQueue-reportBuildFailure';
const publishedEndpoint = 'https://europe-west3-unity-ci-versions.cloudfunctions.net/buildQueue-reportPublication';

const token = core.getInput('token', { required: true });
const jobId = core.getInput('jobId', { required: true });
const buildId = core.getInput('buildId', { required: true });
const status = core.getInput('status', { required: true })

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
};

if (status === 'started') {
  try {
    const imageType = core.getInput('imageType', { required: true });
    const baseOs = core.getInput('baseOs', { required: true });
    const repoVersion = core.getInput('repoVersion', { required: true });
    const unityVersion = core.getInput('unityVersion', { required: false }) || 'none';
    const targetPlatform = core.getInput('targetPlatform', { required: false }) || 'none';

    body = {
      jobId,
      buildId,
      imageType,
      baseOs,
      repoVersion,
      unityVersion,
      targetPlatform,
    }

    const { statusCode, data } = await post(startedEndpoint, {headers, body});
    console.log('Reported that this build has started.', statusCode, data);
  } catch (err) {
    console.error('An error occurred while reporting the start of this build.', err.statusCode, err.message);
    console.error('~> data:', err.data);
  }

  return;
}

if (status === 'failed') {
  try {
    const reason = core.getInput('reason', { required: true });

    body = {
      buildId,
      failure: {
        reason,
      }
    }

    const { statusCode, data } = await post(failedEndpoint, {headers, body});
    console.log('Successfully reported the build failure.', statusCode, data);
  } catch (err) {
    console.error('An error occurred while reporting the build failure.', err.statusCode, err.message);
    console.error('~> data:', err.data);
  }

  return;
}

if (status === 'published') {
  try {
    const imageRepo = core.getInput('imageRepo', { required: true });
    const imageName = core.getInput('imageName', { required: true });
    const friendlyTag = core.getInput('friendlyTag', { required: true });
    const specificTag = core.getInput('specificTag', { required: true });
    const hash = core.getInput('hash', { required: true });

    body = {
      buildId,
      dockerPublicationInfo: {
        imageRepo,
        imageName,
        friendlyTag,
        specificTag,
        hash,
      }
    }

    const { statusCode, data } = await post(publishedEndpoint, {headers, body});
    console.log('Successfully reported this publication.', statusCode, data);
  } catch (err) {
    console.error('An error occurred while reporting this publication.', err.statusCode, err.message);
    console.error('~> data:', err.data);
  }

  return;
}


