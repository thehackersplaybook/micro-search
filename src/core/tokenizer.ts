import config from '../config/index.js';

// Common English stopwords
const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'he',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'that',
  'the',
  'to',
  'was',
  'were',
  'will',
  'with',
  'the',
  'this',
  'but',
  'they',
  'have',
  'had',
  'what',
  'when',
  'where',
  'who',
  'which',
  'why',
  'how',
  'over',
]);

// Pre-compiled regex patterns for better performance
const WORD_REGEX = /\W+/g;
const WHITESPACE_REGEX = /\s+/g;

// Query tokenization cache to avoid repeated processing
const QUERY_CACHE = new Map<string, string[]>();
const MAX_CACHE_SIZE = 1000;

/**
 * Generates n-grams from a string
 * @param text Input text
 * @param n N-gram size
 */
function generateNgrams(text: string, n: number = 3): string[] {
  const tokens = text.toLowerCase().split(WORD_REGEX).filter(Boolean);
  const ngrams: string[] = [];

  for (const token of tokens) {
    if (token.length < n) {
      ngrams.push(token);
      continue;
    }
    for (let i = 0; i <= token.length - n; i++) {
      ngrams.push(token.slice(i, i + n));
    }
  }

  return ngrams;
}

/**
 * Tokenizes text based on configuration with query caching
 * @param text Input text
 * @param isQuery Whether this is a query (enables caching)
 * @returns Array of tokens
 */
export function tokenize(text: string, isQuery: boolean = false): string[] {
  // Check cache for queries
  if (isQuery && QUERY_CACHE.has(text)) {
    return QUERY_CACHE.get(text)!;
  }

  let tokens: string[];

  switch (config.TOKENIZATION_MODE) {
    case 'ngram':
      tokens = generateNgrams(text);
      break;
    case 'whitespace':
      tokens = text.split(WHITESPACE_REGEX);
      break;
    case 'word':
    default:
      tokens = text.toLowerCase().split(WORD_REGEX).filter(Boolean);
  }

  if (config.REMOVE_STOPWORDS) {
    tokens = tokens.filter((token) => !STOPWORDS.has(token.toLowerCase()));
  }

  // Cache query tokens
  if (isQuery) {
    if (QUERY_CACHE.size >= MAX_CACHE_SIZE) {
      // Remove oldest entry (simple LRU)
      const firstKey = QUERY_CACHE.keys().next().value;
      if (firstKey !== undefined) {
        QUERY_CACHE.delete(firstKey);
      }
    }
    QUERY_CACHE.set(text, tokens);
  }

  return tokens;
}

// Pre-compiled regex cache for snippet generation
const SNIPPET_REGEX_CACHE = new Map<string, RegExp>();

/**
 * Extracts a snippet from text containing query terms (optimized)
 * @param text Full text
 * @param queryTokens Query tokens
 * @returns Snippet with highlighted query terms
 */
export function generateSnippet(text: string, queryTokens: string[]): string {
  if (queryTokens.length === 0) {
    return text.slice(0, config.SNIPPET_LENGTH);
  }

  // Cache regex patterns for better performance
  const queryKey = queryTokens.join('|');
  let queryRegex = SNIPPET_REGEX_CACHE.get(queryKey);
  if (!queryRegex) {
    queryRegex = new RegExp(queryTokens.join('|'), 'gi');
    if (SNIPPET_REGEX_CACHE.size >= 100) {
      // Clear cache if it gets too large
      SNIPPET_REGEX_CACHE.clear();
    }
    SNIPPET_REGEX_CACHE.set(queryKey, queryRegex);
  }

  // Find first match position
  queryRegex.lastIndex = 0; // Reset regex state
  const match = queryRegex.exec(text);
  if (!match) {
    return text.slice(0, config.SNIPPET_LENGTH);
  }

  const matchIndex = match.index;
  const contextWords = config.SNIPPET_CONTEXT_WORDS;

  // Split into words only once
  const words = text.split(WHITESPACE_REGEX);

  // Find word index of match more efficiently
  let charCount = 0;
  let matchWordIndex = 0;

  for (let i = 0; i < words.length; i++) {
    if (charCount + words[i].length >= matchIndex) {
      matchWordIndex = i;
      break;
    }
    charCount += words[i].length + 1; // +1 for space
  }

  // Extract context around match
  const start = Math.max(0, matchWordIndex - contextWords);
  const end = Math.min(words.length, matchWordIndex + contextWords);

  let snippet = words.slice(start, end).join(' ');

  // Add ellipsis if truncated
  if (start > 0) snippet = '...' + snippet;
  if (end < words.length) snippet = snippet + '...';

  // Highlight query terms using cached regex
  queryRegex.lastIndex = 0; // Reset regex state
  snippet = snippet.replace(queryRegex, (match) => `**${match}**`);

  return snippet;
}
