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

/**
 * Generates n-grams from a string
 * @param text Input text
 * @param n N-gram size
 */
function generateNgrams(text: string, n: number = 3): string[] {
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
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
 * Tokenizes text based on configuration
 * @param text Input text
 * @returns Array of tokens
 */
export function tokenize(text: string): string[] {
  let tokens: string[];

  switch (config.TOKENIZATION_MODE) {
    case 'ngram':
      tokens = generateNgrams(text);
      break;
    case 'whitespace':
      tokens = text.split(/\s+/);
      break;
    case 'word':
    default:
      tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
  }

  if (config.REMOVE_STOPWORDS) {
    tokens = tokens.filter((token) => !STOPWORDS.has(token.toLowerCase()));
  }

  return tokens;
}

/**
 * Extracts a snippet from text containing query terms
 * @param text Full text
 * @param queryTokens Query tokens
 * @returns Snippet with highlighted query terms
 */
export function generateSnippet(text: string, queryTokens: string[]): string {
  const words = text.split(/\s+/);
  const queryRegex = new RegExp(queryTokens.join('|'), 'gi');

  // Find first match position
  const match = queryRegex.exec(text);
  if (!match) {
    return text.slice(0, config.SNIPPET_LENGTH);
  }

  const matchIndex = match.index;
  const contextWords = config.SNIPPET_CONTEXT_WORDS;

  // Find word index of match
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

  // Highlight query terms
  snippet = snippet.replace(queryRegex, (match) => `**${match}**`);

  return snippet;
}
