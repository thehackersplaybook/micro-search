// Auto-generated version info - DO NOT EDIT MANUALLY
// This file is updated by the release script

export const VERSION_INFO: {
  version: string;
  buildDate: string;
  gitHash: string;
  gitBranch: string;
  releaseType: 'alpha' | 'beta' | 'rc' | 'stable';
} = {
  version: '0.0.7',
  buildDate: '2025-07-20T23:51:28.788Z',
  gitHash: '816a654f22f24a199a9adba93e77df3caca7b8e4',
  gitBranch: 'feat/performance-optimization',
  releaseType: 'stable'
};

export const getVersionInfo = () => VERSION_INFO;

export const getFullVersionString = () => {
  const { version, buildDate, gitHash } = VERSION_INFO;
  const shortHash = gitHash && gitHash.length > 7 ? gitHash.substring(0, 7) : gitHash || 'unknown';
  return `v${version} (${shortHash}) - ${new Date(buildDate).toISOString().split('T')[0]}`;
};

export const isPreRelease = () => {
  return VERSION_INFO.version.includes('-') || VERSION_INFO.releaseType === 'alpha' || VERSION_INFO.releaseType === 'beta' || VERSION_INFO.releaseType === 'rc';
};

// Re-export version for convenience
export const version = VERSION_INFO.version;
export default VERSION_INFO;