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

interface PrecomputedIDF {
  [term: string]: number;
}

class SearchIndex {
  private documents: Map<string | number, SearchDocument>;
  private documentTerms: DocumentTerms;
  private documentFrequencies: DocumentFrequency;
  private precomputedIDF: PrecomputedIDF;
  private totalDocuments: number;
  private idfNeedsUpdate: boolean;

  constructor() {
    this.documents = new Map();
    this.documentTerms = {};
    this.documentFrequencies = {};
    this.precomputedIDF = {};
    this.totalDocuments = 0;
    this.idfNeedsUpdate = false;
  }

  public indexDocument(doc: SearchDocument): void {
    this.documents.set(doc.id, doc);
    this.totalDocuments++;
    this.idfNeedsUpdate = true;

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

  private updatePrecomputedIDF(): void {
    if (!this.idfNeedsUpdate) return;
    
    this.precomputedIDF = {};
    for (const [term, df] of Object.entries(this.documentFrequencies)) {
      this.precomputedIDF[term] = Math.log(this.totalDocuments / df);
    }
    this.idfNeedsUpdate = false;
  }

  public search(query: string): Map<string | number, number> {
    const queryTokens = tokenize(query, true); // Enable query caching
    const scores = new Map<string | number, number>();

    if (queryTokens.length === 0) {
      return scores;
    }

    // Ensure IDF values are up to date
    this.updatePrecomputedIDF();

    // Pre-filter documents more efficiently using inverted index approach
    const candidateDocIds: string[] = [];
    
    // Always find union of documents containing any term first
    const candidateSet = new Set<string>();
    for (const token of queryTokens) {
      for (const [docId, termFreqs] of Object.entries(this.documentTerms)) {
        if (termFreqs[token]) {
          candidateSet.add(docId);
        }
      }
    }
    candidateDocIds.push(...candidateSet);

    // Calculate TF-IDF scores for candidate documents only
    for (const docId of candidateDocIds) {
      const termFreqs = this.documentTerms[docId];
      let score = 0;
      let hasAllTokens = true;

      for (const token of queryTokens) {
        const tf = termFreqs[token];
        if (tf) {
          const idf = this.precomputedIDF[token];
          score += tf * idf;
        } else if (config.ALLOW_PHRASE_SEARCH) {
          hasAllTokens = false;
          break;
        }
      }

      // Include document if it meets phrase search requirements (score can be negative for very common terms)
      if (!config.ALLOW_PHRASE_SEARCH || hasAllTokens) {
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
    this.precomputedIDF = {};
    this.totalDocuments = 0;
    this.idfNeedsUpdate = false;
  }
}

// Export singleton instance
const index = new SearchIndex();

// Export methods
export const indexDocument = index.indexDocument.bind(index);
export const searchIndex = index.search.bind(index);
export const getDocument = index.getDocument.bind(index);
export const clearIndex = index.clear.bind(index);
