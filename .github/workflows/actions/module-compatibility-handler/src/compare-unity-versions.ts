/**
 * Compares Unity Versions
 * Returns -1 if versionA is less than versionB
 * Returns 1 if versionA is greater than versionB
 * Returns 0 if the versions are identical
 */
export function compareVersions(versionA: string, versionB: string) {
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
