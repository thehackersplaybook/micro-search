import { indexDocument, searchIndex, getDocument, clearIndex } from './indexing';
import { loadDocuments } from '../utils/file';
import { info } from '../logger';

export interface SearchDocument {
  id: string | number;
  title: string;
  content: string;
}

export interface SearchResult {
  docId: string | number;
  title: string;
  path: string;
  snippet: string;
  score: number;
}

export async function addDocumentsFromPath(path: string): Promise<void> {
  info('search', 'Adding documents from path:', path);
  const docs = await loadDocuments(path);
  for (const doc of docs) {
    indexDocument(doc);
  }
}

export async function search(
  query: string,
  opts?: any
): Promise<SearchResult[]> {
  const scoredDocIds = searchIndex(query);
  const results: SearchResult[] = [];

  for (const [id, score] of scoredDocIds.entries()) {
    const doc = getDocument(id);
    if (doc) {
      results.push({
        docId: doc.id,
        title: doc.title,
        path: String(doc.id),
        snippet: doc.content.substring(0, 100),
        score: score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export { clearIndex };
