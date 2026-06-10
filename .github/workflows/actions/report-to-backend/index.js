const core = require('@actions/core');

const startedEndpoint = 'https://europe-west3-unity-ci-versions.cloudfunctions.net/reportNewBuild';
const failedEndpoint = 'https://europe-west3-unity-ci-versions.cloudfunctions.net/reportBuildFailure';
const publishedEndpoint = 'https://europe-west3-unity-ci-versions.cloudfunctions.net/reportPublication';

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000;

async function postWithRetry(url, headers, body) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.text();
    let parsed;
    try { parsed = JSON.parse(data); } catch { parsed = data; }

    if (response.ok) {
      return { statusCode: response.status, data: parsed };
    }

    // 409 = duplicate dispatch, not a transient error
    if (response.status === 409) {
      const err = new Error(`${response.status} ${response.statusText}`);
      err.statusCode = response.status;
      err.data = parsed;
      throw err;
    }

    // Retry on 5xx (server) errors
    if (response.status >= 500 && attempt < MAX_RETRIES) {
      const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
      core.warning(`Backend returned ${response.status}, retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    // Non-retryable error or final attempt
    const err = new Error(`${response.status} ${response.statusText}`);
    err.statusCode = response.status;
    err.data = parsed;
    throw err;
  }
}

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

      const { statusCode, data } = await postWithRetry(startedEndpoint, headers, body);
      console.log('Reported that this build has started.', statusCode, data);
    } catch (err) {
      // 409 means the build is already in progress or published (duplicate dispatch).
      // Exit gracefully so the workflow does not trigger the "Report failure" step.
      if (err.statusCode === 409) {
        core.warning(`Duplicate dispatch: ${err.data || 'build already exists'}. Exiting gracefully.`);
        process.exit(0);
      }
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

      const { statusCode, data } = await postWithRetry(failedEndpoint, headers, body);
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

      const { statusCode, data } = await postWithRetry(publishedEndpoint, headers, body);
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
