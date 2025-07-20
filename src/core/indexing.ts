import { SearchDocument } from './search.js';
import { tokenize } from './tokenizer.js';
import config from '../config/index.js';

interface DocumentFrequency {
  [term: string]: number;
}

interface TermFrequency {
  [term: string]: number;
}

interface DocumentTerms {
  [docId: string]: TermFrequency;
}

class SearchIndex {
  private documents: Map<string | number, SearchDocument>;
  private documentTerms: DocumentTerms;
  private documentFrequencies: DocumentFrequency;
  private totalDocuments: number;

  constructor() {
    this.documents = new Map();
    this.documentTerms = {};
    this.documentFrequencies = {};
    this.totalDocuments = 0;
  }

  public indexDocument(doc: SearchDocument): void {
    this.documents.set(doc.id, doc);
    this.totalDocuments++;

    // Calculate term frequencies for title and content
    const titleTokens = tokenize(doc.title);
    const contentTokens = tokenize(doc.content);
    const docId = String(doc.id);

    // Initialize document terms
    this.documentTerms[docId] = {};

    // Process title tokens with higher weight
    for (const token of titleTokens) {
      this.documentTerms[docId][token] = (this.documentTerms[docId][token] || 0) + config.FIELD_WEIGHTS.title;
      this.documentFrequencies[token] = (this.documentFrequencies[token] || 0) + 1;
    }

    // Process content tokens
    for (const token of contentTokens) {
      this.documentTerms[docId][token] = (this.documentTerms[docId][token] || 0) + config.FIELD_WEIGHTS.content;
      this.documentFrequencies[token] = (this.documentFrequencies[token] || 0) + 1;
    }
  }

  public search(query: string): Map<string | number, number> {
    const queryTokens = tokenize(query);
    const scores = new Map<string | number, number>();

    if (queryTokens.length === 0) {
      return scores;
    }

    // Calculate TF-IDF scores for each document
    for (const [docId, termFreqs] of Object.entries(this.documentTerms)) {
      let score = 0;
      let allTokensFound = true;

      for (const token of queryTokens) {
        if (!termFreqs[token]) {
          if (config.ALLOW_PHRASE_SEARCH) {
            allTokensFound = false;
            break;
          }
          continue;
        }

        // TF-IDF calculation
        const tf = termFreqs[token];
        const df = this.documentFrequencies[token];
        const idf = Math.log(this.totalDocuments / df);
        score += tf * idf;
      }

      if (!config.ALLOW_PHRASE_SEARCH || allTokensFound) {
        scores.set(docId, score);
      }
    }

    return scores;
  }

  public getDocument(id: string | number): SearchDocument | undefined {
    return this.documents.get(id);
  }

  public clear(): void {
    this.documents.clear();
    this.documentTerms = {};
    this.documentFrequencies = {};
    this.totalDocuments = 0;
  }
}

// Export singleton instance
const index = new SearchIndex();

// Export methods
export const indexDocument = index.indexDocument.bind(index);
export const searchIndex = index.search.bind(index);
export const getDocument = index.getDocument.bind(index);
export const clearIndex = index.clear.bind(index);
