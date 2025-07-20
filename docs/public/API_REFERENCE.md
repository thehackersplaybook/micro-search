# API Reference - @microsearch/lightning

Complete API documentation for the lightning-fast search engine..

## Core Functions

### `addDocumentsFromPath(path: string): Promise<void>`

Loads and indexes all markdown and text files from the specified directory path..

**Parameters:**
- `path` (string): Absolute or relative path to the directory containing documents.

**Returns:** Promise that resolves when indexing is complete..

**Example:**
```javascript
await addDocumentsFromPath('./documentation');
await addDocumentsFromPath('/absolute/path/to/docs');
```

**Throws:**
- `Error`: If directory doesn't exist or is inaccessible.
- `Error`: If no readable files are found in the directory.

---

### `search(query: string, options?: SearchOptions): Promise<SearchResult[]>`

Performs a text search across the indexed documents..

**Parameters:**
- `query` (string): The search query string.
- `options` (SearchOptions, optional): Search configuration options.

**Returns:** Promise resolving to an array of search results, ranked by relevance..

**Example:**
```javascript
const results = await search('TypeScript tutorial');
const limitedResults = await search('React hooks', { limit: 5 });
const weightedResults = await search('API documentation', {
  titleWeight: 2.0,
  contentWeight: 1.0
});
```

---

### `clearIndex(): void`

Clears the current search index, removing all indexed documents..

**Example:**
```javascript
clearIndex();
await addDocumentsFromPath('./new-documents');
```

---

### `getVersionInfo(): VersionInfo`

Returns version and build information about the library..

**Returns:** VersionInfo object containing version details..

**Example:**
```javascript
const info = getVersionInfo();
console.log(`Version: ${info.version}`);
console.log(`Build Date: ${info.buildDate}`);
console.log(`Git Hash: ${info.gitHash}`);
```

---

## Types

### `SearchOptions`

Configuration options for search queries..

```typescript
interface SearchOptions {
  limit?: number;           // Maximum number of results (default: 10)
  fields?: string[];        // Fields to search in (default: all fields)
}
```

**Properties:**
- `limit`: Maximum number of search results to return.
- `fields`: Array of field names to search in (e.g., ['title', 'content']).

---

### `SearchResult`

Represents a single search result..

```typescript
interface SearchResult {
  docId: string | number;   // Unique document identifier
  title: string;           // Document title
  path: string;            // File path
  snippet: string;         // Text snippet with highlighted matches
  score: number;           // Relevance score (0-1)
}
```

**Properties:**
- `docId`: Unique identifier for the document.
- `title`: Extracted or inferred title of the document.
- `path`: File system path to the document.
- `snippet`: Context snippet showing the match with highlighted terms.
- `score`: Numerical relevance score, higher values indicate better matches.

---

### `SearchDocument`

Internal representation of an indexed document..

```typescript
interface SearchDocument {
  id: string | number;      // Unique document identifier
  title: string;           // Document title
  content: string;         // Full document content
  path: string;            // File path
}
```

---

### `VersionInfo`

Version and build information..

```typescript
interface VersionInfo {
  version: string;          // Semantic version
  buildDate: string;        // ISO build timestamp
  gitHash: string;          // Git commit hash
  gitBranch: string;        // Git branch name
  releaseType: 'alpha' | 'beta' | 'rc' | 'stable';
}
```

---

## Utility Functions

### `tokenize(text: string): string[]`

Tokenizes text into searchable terms based on configuration..

**Parameters:**
- `text` (string): Input text to tokenize.

**Returns:** Array of normalized, searchable tokens..

**Example:**
```javascript
import { tokenize } from '@microsearch/lightning';

const tokens = tokenize('Hello, World! This is a test.');
// Returns: ['hello', 'world', 'test'] (stopwords removed)
```

---

### `generateSnippet(text: string, queryTerms: string[]): string`

Generates a context snippet around matching terms..

**Parameters:**
- `text` (string): Source text to extract snippet from.
- `queryTerms` (string[]): Array of search terms to highlight.

**Returns:** Formatted snippet with highlighted terms..

**Example:**
```javascript
import { generateSnippet } from '@microsearch/lightning';

const snippet = generateSnippet(
  'This is a long document about search engines and algorithms.',
  ['search', 'algorithms']
);
// Returns: 'This is a long document about **search** engines and **algorithms**.'
```

---

### `getFullVersionString(): string`

Returns a formatted version string with build information..

**Returns:** Human-readable version string..

**Example:**
```javascript
import { getFullVersionString } from '@microsearch/lightning';

console.log(getFullVersionString());
// Output: 'v0.0.3 (a1b2c3d) - 2025-07-20'
```

---

### `isPreRelease(): boolean`

Checks if the current version is a pre-release..

**Returns:** Boolean indicating if this is a pre-release version..

**Example:**
```javascript
import { isPreRelease } from '@microsearch/lightning';

if (isPreRelease()) {
  console.log('Running pre-release version');
}
```

---

## Configuration

Environment variables that control library behavior.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ROOT_DOCS_FOLDER` | string | `./data/markdown` | Default directory for document loading |
| `MAX_DOCS` | number | `100000` | Maximum number of documents to index |
| `SEARCH_MAX_RESULTS` | number | `10` | Default maximum search results |
| `VERBOSE` | boolean | `false` | Enable detailed logging |
| `ALLOW_PHRASE_SEARCH` | boolean | `true` | Enable phrase search functionality |
| `TIMEOUT_WARN_MS` | number | `100` | Log warning if search exceeds this time |
| `TOKENIZATION_MODE` | string | `word` | Tokenization strategy: `word`, `ngram`, `whitespace` |
| `SNIPPET_LENGTH` | number | `150` | Maximum snippet length in characters |

---

## Error Handling

The library throws specific error types for different failure scenarios.

### Document Loading Errors
```javascript
try {
  await addDocumentsFromPath('./nonexistent');
} catch (error) {
  if (error.message.includes('Directory not found')) {
    // Handle missing directory
  }
}
```

### Search Errors
```javascript
try {
  const results = await search('');
} catch (error) {
  if (error.message.includes('Empty query')) {
    // Handle empty search query
  }
}
```

### Performance Warnings
Performance warnings are logged automatically when search operations exceed the configured timeout threshold..

---

## Performance Characteristics

- **Search Speed**: <100ms per query (typically <10ms)
- **Memory Usage**: ~16MB base + document size
- **Indexing Speed**: ~1000 documents/second
- **Supported Dataset**: Up to 1GB of text content
- **Concurrent Queries**: Thread-safe for read operations

---

## Browser Compatibility

This library is designed for Node.js environments and uses Node.js-specific APIs. For browser usage, consider.

1. Using a bundler that provides Node.js polyfills.
2. Server-side rendering with search results.
3. API endpoint integration.

---

## TypeScript Support

The library is written in TypeScript and provides full type definitions. No additional `@types` packages are required..

```typescript
import type { SearchResult, SearchOptions } from '@microsearch/lightning';

const options: SearchOptions = {
  limit: 20,
  titleWeight: 2.0
};

const results: SearchResult[] = await search('query', options);
```