export {
  addDocumentsFromPath,
  search,
  clearIndex,
  SearchDocument,
  SearchResult,
  SearchOptions,
} from './core/search.js';

export { tokenize, generateSnippet } from './core/tokenizer.js';
export { loadDocuments } from './utils/file.js';
export { info, warn, error, debug } from './logger/index.js';
export { default as config } from './config/index.js';

// Version information exports
export {
  VERSION_INFO,
  getVersionInfo,
  getFullVersionString,
  isPreRelease,
  version
} from './version.js';
