import { SearchDocument } from './search';

let index = new Map<string, Map<string | number, number>>();
let documents = new Map<string | number, SearchDocument>();

export function indexDocument(doc: SearchDocument): void {
  documents.set(doc.id, doc);
  const tokens = tokenize(doc.content);
  const termFrequencies = new Map<string, number>();

  for (const token of tokens) {
    termFrequencies.set(token, (termFrequencies.get(token) || 0) + 1);
  }

  for (const [token, freq] of termFrequencies.entries()) {
    if (!index.has(token)) {
      index.set(token, new Map());
    }
    index.get(token)!.set(doc.id, freq);
  }
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\W+/).filter(Boolean);
}

export function searchIndex(query: string): Map<string | number, number> {
  const queryTokens = tokenize(query);
  const results = new Map<string | number, number>();

  if (queryTokens.length === 0) {
    return results;
  }

  const firstToken = queryTokens[0];
  const initialResults = index.get(firstToken) || new Map();

  for (const [docId, freq] of initialResults.entries()) {
    let score = freq;
    let allTokensFound = true;

    for (let i = 1; i < queryTokens.length; i++) {
      const token = queryTokens[i];
      const tokenDocs = index.get(token);
      if (tokenDocs && tokenDocs.has(docId)) {
        score += tokenDocs.get(docId)!;
      } else {
        allTokensFound = false;
        break;
      }
    }

    if (allTokensFound) {
      results.set(docId, score);
    }
  }

  return results;
}

export function getDocument(id: string | number): SearchDocument | undefined {
  return documents.get(id);
}

export function clearIndex(): void {
  console.log('Clearing index...');
  index = new Map<string, Map<string | number, number>>();
  documents = new Map<string | number, SearchDocument>();
}
