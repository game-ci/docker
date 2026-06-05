#!/usr/bin/env node

const { execFileSync } = require('node:child_process');

const dockerHubApi = 'https://hub.docker.com/v2/repositories';
const unityWhatsNewUrl = 'https://unity.com/releases/editor/whats-new';

const ubuntuEditorPlatforms = [
  'base',
  'linux-il2cpp',
  'windows-mono',
  'mac-mono',
  'ios',
  'android',
  'webgl',
];

const windowsEditorPlatforms = [
  'base',
  'windows-il2cpp',
  'universal-windows-platform',
  'appletv',
  'android',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

const optionalEnv = (name, fallback) => process.env[name] || fallback;

const parseBool = (value) => /^(1|true|yes)$/i.test(String(value || ''));

const normalizeVersion = (version) => String(version || '').replace(/^v/, '');

const splitRepoVersion = (version) => {
  const normalized = normalizeVersion(version);
  const [major, minor] = normalized.split('.');

  if (!major || !minor) {
    throw new Error(`Repo version "${version}" does not look like a semantic version`);
  }

  return {
    full: normalized,
    minor: `${major}.${minor}`,
    major,
  };
};

const latestGitTag = () => {
  const tag = execFileSync('git', ['describe', '--tags', execFileSync('git', ['rev-list', '--tags', '--max-count=1'], { encoding: 'utf8' }).trim()], { encoding: 'utf8' }).trim();
  return normalizeVersion(tag);
};

const parseVersions = () => {
  const raw = requiredEnv('UNITY_VERSIONS_JSON');
  const versions = JSON.parse(raw);

  if (!Array.isArray(versions) || versions.length === 0) {
    throw new Error('UNITY_VERSIONS_JSON must be a non-empty JSON array');
  }

  return versions
    .filter((item) => item && item.version && item.changeset)
    .sort(compareUnityVersions);
};

const parseUnityVersionParts = (version) => {
  const match = /^(\d+)\.(\d+)\.(\d+)f(\d+)$/.exec(version);
  if (!match) {
    return [0, 0, 0, 0];
  }

  return match.slice(1).map(Number);
};

const compareUnityVersions = (a, b) => {
  if (a.versionNumber && b.versionNumber) {
    return Number(b.versionNumber) - Number(a.versionNumber);
  }

  const left = parseUnityVersionParts(a.version);
  const right = parseUnityVersionParts(b.version);

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return right[index] - left[index];
    }
  }

  return 0;
};

const fetchWithRetry = async (url, options = {}) => {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.status >= 500 || response.status === 429) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await sleep(attempt * 1500);
      }
    }
  }

  throw lastError;
};

const dockerTagExists = async (repository, tag) => {
  const response = await fetchWithRetry(`${dockerHubApi}/${repository}/tags/${tag}`);

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    throw new Error(`DockerHub tag check failed for ${repository}:${tag} with HTTP ${response.status}`);
  }

  return true;
};

const scrapeLatestOfficialUnityVersion = async () => {
  const response = await fetchWithRetry(unityWhatsNewUrl, {
    headers: {
      'User-Agent': 'game-ci-docker-self-heal/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Unity release page returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const versionMatch = /Unity\s+(\d+\.\d+\.\d+f\d+)/.exec(html);
  const escapedVersion = versionMatch?.[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const changesetMatch = versionMatch
    ? new RegExp(`unityhub://${escapedVersion}/([a-f0-9]{12})`, 'i').exec(html) ||
      /Changeset:\s*([a-f0-9]{12})/i.exec(html)
    : null;

  if (!versionMatch || !changesetMatch) {
    console.log('No latest Unity release could be parsed from the official release page.');
    return null;
  }

  return {
    version: versionMatch[1],
    changeset: changesetMatch[1],
  };
};

const mergeOfficialUnityVersion = async (versions) => {
  const latestOfficialVersion = await scrapeLatestOfficialUnityVersion();
  if (!latestOfficialVersion) {
    return versions;
  }

  if (versions.some((version) => version.version === latestOfficialVersion.version)) {
    return versions;
  }

  console.log(`adding official Unity release fallback ${latestOfficialVersion.version}`);
  return [...versions, latestOfficialVersion].sort(compareUnityVersions);
};

const dispatch = async ({ eventType, payload, dryRun, token, repository }) => {
  if (dryRun) {
    console.log(`[dry-run] dispatch ${eventType}`, JSON.stringify(payload));
    return;
  }

  const response = await fetchWithRetry(`https://api.github.com/repos/${repository}/dispatches`, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28',
    },
    body: JSON.stringify({
      event_type: eventType,
      client_payload: payload,
    }),
  });

  if (response.status !== 204) {
    const text = await response.text();
    throw new Error(`Failed to dispatch ${eventType}: HTTP ${response.status} ${text}`);
  }

  console.log(`dispatched ${eventType}`, JSON.stringify(payload));
};

const buildPayload = ({ jobId, repoVersion, unityVersion, targetPlatform }) => ({
  jobId,
  repoVersionFull: repoVersion.full,
  repoVersionMinor: repoVersion.minor,
  repoVersionMajor: repoVersion.major,
  ...(unityVersion ? {
    editorVersion: unityVersion.version,
    changeSet: unityVersion.changeset,
  } : {}),
  ...(targetPlatform ? { targetPlatform } : {}),
});

const healPrerequisite = async ({ imageName, baseOs, eventType, repoVersion, jobPrefix, dryRun, token, repository, planned }) => {
  const tag = baseOs === 'ubuntu' ? `ubuntu-${repoVersion.full}` : `windows-${repoVersion.full}`;
  const exists = await dockerTagExists(`unityci/${imageName}`, tag);

  if (exists) {
    console.log(`ok unityci/${imageName}:${tag}`);
    return true;
  }

  const payload = buildPayload({
    jobId: `${jobPrefix}-${baseOs}-${imageName}-${repoVersion.full}`,
    repoVersion,
  });

  planned.push({ eventType, image: `unityci/${imageName}:${tag}`, payload });
  await dispatch({ eventType, payload, dryRun, token, repository });
  return false;
};

const healEditorPlatform = async ({ baseOs, targetPlatform, eventType, repoVersion, unityVersion, jobPrefix, dryRun, token, repository, planned }) => {
  const tag = `${baseOs}-${unityVersion.version}-${targetPlatform}-${repoVersion.full}`;
  const exists = await dockerTagExists('unityci/editor', tag);

  if (exists) {
    console.log(`ok unityci/editor:${tag}`);
    return;
  }

  const payload = buildPayload({
    jobId: `${jobPrefix}-${baseOs}-editor-${unityVersion.version}-${targetPlatform}-${repoVersion.full}`,
    repoVersion,
    unityVersion,
    targetPlatform,
  });

  planned.push({ eventType, image: `unityci/editor:${tag}`, payload });
  await dispatch({ eventType, payload, dryRun, token, repository });
};

const main = async () => {
  const dryRun = parseBool(optionalEnv('DRY_RUN', 'false'));
  const token = optionalEnv('GITHUB_TOKEN', '');
  const repository = requiredEnv('GITHUB_REPOSITORY');
  const jobPrefix = optionalEnv('JOB_PREFIX', `self-heal-${Date.now()}`);
  const versionsToCheck = Number(optionalEnv('VERSIONS_TO_CHECK', '1'));
  const repoVersion = splitRepoVersion(optionalEnv('REPO_VERSION_FULL', latestGitTag()));
  const versions = (await mergeOfficialUnityVersion(parseVersions())).slice(0, versionsToCheck);
  const planned = [];

  if (!dryRun && !token) {
    throw new Error('GITHUB_TOKEN is required unless DRY_RUN=true');
  }

  console.log(`repoVersion=${repoVersion.full}`);
  console.log(`versions=${versions.map((version) => version.version).join(',')}`);

  const ubuntuBaseOk = await healPrerequisite({
    imageName: 'base',
    baseOs: 'ubuntu',
    eventType: 'new_ubuntu_base_image_requested',
    repoVersion,
    jobPrefix,
    dryRun,
    token,
    repository,
    planned,
  });

  const ubuntuHubOk = ubuntuBaseOk && await healPrerequisite({
    imageName: 'hub',
    baseOs: 'ubuntu',
    eventType: 'new_ubuntu_hub_image_requested',
    repoVersion,
    jobPrefix,
    dryRun,
    token,
    repository,
    planned,
  });

  const windowsBaseOk = await healPrerequisite({
    imageName: 'base',
    baseOs: 'windows',
    eventType: 'new_windows_base_image_requested',
    repoVersion,
    jobPrefix,
    dryRun,
    token,
    repository,
    planned,
  });

  const windowsHubOk = windowsBaseOk && await healPrerequisite({
    imageName: 'hub',
    baseOs: 'windows',
    eventType: 'new_windows_hub_image_requested',
    repoVersion,
    jobPrefix,
    dryRun,
    token,
    repository,
    planned,
  });

  for (const unityVersion of versions) {
    if (ubuntuHubOk) {
      for (const targetPlatform of ubuntuEditorPlatforms) {
        await healEditorPlatform({
          baseOs: 'ubuntu',
          targetPlatform,
          eventType: 'retry_ubuntu_editor_image_requested',
          repoVersion,
          unityVersion,
          jobPrefix,
          dryRun,
          token,
          repository,
          planned,
        });
      }
    } else {
      console.log('skipping ubuntu editor checks until ubuntu base/hub prerequisites exist');
    }

    if (windowsHubOk) {
      for (const targetPlatform of windowsEditorPlatforms) {
        await healEditorPlatform({
          baseOs: 'windows',
          targetPlatform,
          eventType: 'retry_windows_editor_image_requested',
          repoVersion,
          unityVersion,
          jobPrefix,
          dryRun,
          token,
          repository,
          planned,
        });
      }
    } else {
      console.log('skipping windows editor checks until windows base/hub prerequisites exist');
    }
  }

  console.log(`planned_dispatches=${planned.length}`);
  console.log(JSON.stringify(planned, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
