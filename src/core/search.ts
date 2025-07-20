import { indexDocument, searchIndex, getDocument, clearIndex } from './indexing.js';
import { generateSnippet, tokenize } from './tokenizer.js';
import { loadDocuments } from '../utils/file.js';
import { info, warn } from '../logger/index.js';
import config from '../config/index.js';

export interface SearchDocument {
  id: string | number;
  title: string;
  content: string;
  path?: string;
  [key: string]: unknown;
}

export interface SearchResult {
  docId: string | number;
  title: string;
  path: string;
  snippet: string;
  score: number;
}

export interface SearchOptions {
  limit?: number;
  fields?: string[];
}

export async function addDocumentsFromPath(path: string): Promise<void> {
  info('search', 'Adding documents from path:', path);
  const docs = await loadDocuments(path);

  if (docs.length > config.MAX_DOCS) {
    warn(
      'search',
      `Document count (${docs.length}) exceeds MAX_DOCS (${config.MAX_DOCS}). Only indexing first ${config.MAX_DOCS} documents.`,
    );
    docs.length = config.MAX_DOCS;
  }

  for (const doc of docs) {
    indexDocument(doc);
  }

  info('search', `Indexed ${docs.length} documents`);
}

export async function search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
  const startTime = process.hrtime.bigint();
  const queryTokens = tokenize(query, true); // Enable query caching
  const scoredDocIds = searchIndex(query);
  const results: SearchResult[] = [];

  for (const [id, score] of scoredDocIds.entries()) {
    const doc = getDocument(id);
    if (doc) {
      results.push({
        docId: doc.id,
        title: doc.title,
        path: doc.path || String(doc.id),
        snippet: generateSnippet(doc.content, queryTokens),
        score: score,
      });
    }
  }

  // Sort by score and limit results
  results.sort((a, b) => b.score - a.score);
  if (options.limit || config.SEARCH_MAX_RESULTS) {
    results.length = Math.min(results.length, options.limit || config.SEARCH_MAX_RESULTS);
  }

  // Check search time
  const endTime = process.hrtime.bigint();
  const searchTimeMs = Number(endTime - startTime) / 1_000_000;

  if (searchTimeMs > config.TIMEOUT_WARN_MS) {
    warn(
      'search',
      `Search took ${searchTimeMs.toFixed(2)}ms, exceeding timeout warning threshold of ${config.TIMEOUT_WARN_MS}ms`,
    );
  }

  return results;
}

export { clearIndex };
