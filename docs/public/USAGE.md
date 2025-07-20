# Usage Guide - @microsearch/lightning

Comprehensive usage examples and patterns for the lightning-fast search engine.

## Basic Usage Patterns

### Simple Document Search

```javascript
import { addDocumentsFromPath, search } from '@microsearch/lightning';

// Index documents and search
await addDocumentsFromPath('./documentation');
const results = await search('API reference');

// Display results
results.forEach(result => {
  console.log(`📄 ${result.title}`);
  console.log(`📍 ${result.path}`);
  console.log(`⭐ Score: ${result.score.toFixed(3)}`);
  console.log(`💬 ${result.snippet}\n`);
});
```

### Batch Processing Multiple Directories

```javascript
const directories = ['./docs', './articles', './tutorials'];

for (const dir of directories) {
  try {
    await addDocumentsFromPath(dir);
    console.log(`✅ Indexed ${dir}`);
  } catch (error) {
    console.log(`❌ Failed to index ${dir}: ${error.message}`);
  }
}

const results = await search('getting started guide');
```

### Field-Specific Search Queries

```javascript
// Search only in titles
const titleResults = await search('installation', {
  fields: ['title'],
  limit: 5
});

// Search in specific fields
const targetedResults = await search('configuration', {
  fields: ['title', 'content'],
  limit: 10
});
```

## Advanced Use Cases

### Building a Documentation Search System

```javascript
import { 
  addDocumentsFromPath, 
  search, 
  clearIndex,
  getVersionInfo 
} from '@microsearch/lightning';
import fs from 'fs';
import path from 'path';

class DocumentationSearchEngine {
  constructor() {
    this.isIndexed = false;
    this.documentCount = 0;
  }

  async initialize(docsPath) {
    console.log('🚀 Initializing search engine...');
    
    try {
      clearIndex();
      await addDocumentsFromPath(docsPath);
      this.isIndexed = true;
      
      const version = getVersionInfo();
      console.log(`✅ Search engine ready (v${version.version})`);
      
    } catch (error) {
      console.error('❌ Failed to initialize:', error.message);
      throw error;
    }
  }

  async searchWithFallback(query, options = {}) {
    if (!this.isIndexed) {
      throw new Error('Search engine not initialized');
    }

    const results = await search(query, {
      limit: 10,
      ...options
    });

    // Provide helpful message if no results
    if (results.length === 0) {
      console.log(`💭 No results for "${query}". Try broader terms.`);
    }

    return results;
  }

  async searchMultipleQueries(queries) {
    const allResults = new Map();
    
    for (const query of queries) {
      const results = await this.searchWithFallback(query);
      allResults.set(query, results);
    }
    
    return allResults;
  }
}

// Usage
const searchEngine = new DocumentationSearchEngine();
await searchEngine.initialize('./project-docs');

const results = await searchEngine.searchWithFallback('authentication');
```

### Real-time Search Interface

```javascript
import { search } from '@microsearch/lightning';
import { debounce } from 'lodash'; // npm install lodash

class RealTimeSearch {
  constructor() {
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
    this.lastQuery = '';
    this.cache = new Map();
  }

  async performSearch(query) {
    if (!query.trim() || query === this.lastQuery) {
      return;
    }

    // Check cache first
    if (this.cache.has(query)) {
      this.displayResults(this.cache.get(query), query);
      return;
    }

    try {
      const startTime = performance.now();
      const results = await search(query, { limit: 8 });
      const duration = performance.now() - startTime;

      // Cache results
      this.cache.set(query, results);
      this.lastQuery = query;

      console.log(`🔍 Search completed in ${duration.toFixed(2)}ms`);
      this.displayResults(results, query);

    } catch (error) {
      console.error('Search failed:', error.message);
    }
  }

  displayResults(results, query) {
    console.clear();
    console.log(`🔍 Results for: "${query}"\n`);

    if (results.length === 0) {
      console.log('No results found. Try different keywords.');
      return;
    }

    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   ${result.snippet}`);
      console.log(`   📁 ${result.path} (${result.score.toFixed(3)})\n`);
    });
  }

  search(query) {
    this.debouncedSearch(query);
  }
}

// Usage
const realTimeSearch = new RealTimeSearch();

// Simulate user typing
const queries = ['java', 'javas', 'javasc', 'javascript', 'javascript tutorial'];
for (let i = 0; i < queries.length; i++) {
  setTimeout(() => {
    realTimeSearch.search(queries[i]);
  }, i * 100);
}
```

### Multi-Language Document Support

```javascript
import { addDocumentsFromPath, search } from '@microsearch/lightning';

class MultiLanguageSearch {
  constructor() {
    this.languageIndexes = new Map();
  }

  async indexByLanguage(basePath) {
    const languages = ['en', 'es', 'fr', 'de'];
    
    for (const lang of languages) {
      const langPath = path.join(basePath, lang);
      
      if (fs.existsSync(langPath)) {
        console.log(`📚 Indexing ${lang} documents...`);
        await addDocumentsFromPath(langPath);
        
        // Store language-specific metadata
        this.languageIndexes.set(lang, {
          path: langPath,
          indexed: new Date()
        });
      }
    }
  }

  async searchInLanguage(query, language = 'en') {
    if (!this.languageIndexes.has(language)) {
      throw new Error(`Language ${language} not indexed`);
    }

    const results = await search(query);
    
    // Filter results by language path
    const languagePath = this.languageIndexes.get(language).path;
    return results.filter(result => 
      result.path.startsWith(languagePath)
    );
  }

  async searchAllLanguages(query) {
    const allResults = new Map();
    
    for (const [language] of this.languageIndexes) {
      const results = await this.searchInLanguage(query, language);
      if (results.length > 0) {
        allResults.set(language, results);
      }
    }
    
    return allResults;
  }
}
```

### Analytics and Performance Monitoring

```javascript
import { search, getVersionInfo } from '@microsearch/lightning';

class SearchAnalytics {
  constructor() {
    this.queries = [];
    this.performanceMetrics = {
      totalQueries: 0,
      avgResponseTime: 0,
      slowQueries: [],
      popularTerms: new Map()
    };
  }

  async trackedSearch(query, options = {}) {
    const startTime = performance.now();
    const timestamp = new Date().toISOString();
    
    try {
      const results = await search(query, options);
      const responseTime = performance.now() - startTime;
      
      // Record analytics
      this.recordQuery({
        query,
        responseTime,
        resultCount: results.length,
        timestamp,
        success: true
      });
      
      return results;
      
    } catch (error) {
      this.recordQuery({
        query,
        responseTime: performance.now() - startTime,
        resultCount: 0,
        timestamp,
        success: false,
        error: error.message
      });
      throw error;
    }
  }

  recordQuery(queryData) {
    this.queries.push(queryData);
    this.updateMetrics(queryData);
    
    // Log slow queries
    if (queryData.responseTime > 100) {
      console.warn(`⚠️  Slow query: "${queryData.query}" (${queryData.responseTime.toFixed(2)}ms)`);
    }
  }

  updateMetrics(queryData) {
    this.performanceMetrics.totalQueries++;
    
    // Update average response time
    const totalTime = this.queries.reduce((sum, q) => sum + q.responseTime, 0);
    this.performanceMetrics.avgResponseTime = totalTime / this.queries.length;
    
    // Track slow queries
    if (queryData.responseTime > 100) {
      this.performanceMetrics.slowQueries.push(queryData);
    }
    
    // Track popular terms
    const terms = queryData.query.toLowerCase().split(/\s+/);
    terms.forEach(term => {
      const current = this.performanceMetrics.popularTerms.get(term) || 0;
      this.performanceMetrics.popularTerms.set(term, current + 1);
    });
  }

  generateReport() {
    const report = {
      version: getVersionInfo().version,
      period: {
        start: this.queries[0]?.timestamp,
        end: this.queries[this.queries.length - 1]?.timestamp,
        totalQueries: this.performanceMetrics.totalQueries
      },
      performance: {
        avgResponseTime: `${this.performanceMetrics.avgResponseTime.toFixed(2)}ms`,
        slowQueryCount: this.performanceMetrics.slowQueries.length,
        slowQueryThreshold: '100ms'
      },
      popularTerms: Array.from(this.performanceMetrics.popularTerms.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    };

    console.log('📊 Search Analytics Report');
    console.log('─'.repeat(50));
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }
}

// Usage
const analytics = new SearchAnalytics();

// Perform tracked searches
await analytics.trackedSearch('JavaScript tutorial');
await analytics.trackedSearch('API documentation');
await analytics.trackedSearch('configuration guide');

// Generate analytics report
analytics.generateReport();
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Document Loading
ROOT_DOCS_FOLDER=./documentation
MAX_DOCS=50000

# Search Configuration  
SEARCH_MAX_RESULTS=15
ALLOW_PHRASE_SEARCH=true
TIMEOUT_WARN_MS=100

# Tokenization
TOKENIZATION_MODE=word
SNIPPET_LENGTH=200

# Logging
VERBOSE=false
```

### Configuration in Code

```javascript
import config from '@microsearch/lightning/config';

// Access configuration values
console.log(`Max docs: ${config.MAX_DOCS}`);
console.log(`Snippet length: ${config.SNIPPET_LENGTH}`);
console.log(`Tokenization mode: ${config.TOKENIZATION_MODE}`);
```

### Runtime Configuration Override

```javascript
// Temporarily override configuration
const originalMaxDocs = config.MAX_DOCS;
config.MAX_DOCS = 1000;

await addDocumentsFromPath('./small-dataset');

// Restore original configuration
config.MAX_DOCS = originalMaxDocs;
```

## Best Practices

### 1. Index Management

```javascript
// Good: Clear index when switching datasets
clearIndex();
await addDocumentsFromPath('./new-documents');

// Good: Check if re-indexing is needed
if (documentsChanged) {
  clearIndex();
  await addDocumentsFromPath('./documents');
}
```

### 2. Query Optimization

```javascript
// Good: Use specific terms
const results = await search('React useEffect hook tutorial');

// Better: Use field-specific search for structured queries
const results = await search('useEffect', {
  fields: ['title', 'content'],
  limit: 5
});
```

### 3. Error Handling

```javascript
// Comprehensive error handling
async function robustSearch(query) {
  try {
    if (!query?.trim()) {
      throw new Error('Query cannot be empty');
    }

    const results = await search(query);
    
    if (results.length === 0) {
      console.log(`No results found for: ${query}`);
      // Suggest similar terms or broader queries
    }
    
    return results;
    
  } catch (error) {
    console.error(`Search failed: ${error.message}`);
    return [];
  }
}
```

### 4. Memory Management

```javascript
// Monitor memory usage with large datasets
const memoryBefore = process.memoryUsage().heapUsed / 1024 / 1024;

await addDocumentsFromPath('./large-dataset');

const memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`Memory usage: ${(memoryAfter - memoryBefore).toFixed(2)}MB`);
```

## Troubleshooting

### Common Issues and Solutions

#### No Results Returned
```javascript
// Check if documents are indexed
await addDocumentsFromPath('./docs');
const results = await search('test', { limit: 1 });
if (results.length === 0) {
  console.log('No documents indexed or query too specific');
}
```

#### Slow Performance
```javascript
// Enable performance monitoring
process.env.VERBOSE = 'true';
const startTime = performance.now();
const results = await search('complex query');
console.log(`Search took: ${performance.now() - startTime}ms`);
```

#### Memory Issues
```javascript
// Limit document count
process.env.MAX_DOCS = '10000';
await addDocumentsFromPath('./large-dataset');
```

### Debug Mode

Enable detailed logging for troubleshooting:

```javascript
// Set environment variable
process.env.VERBOSE = 'true';

// Or create .env file:
// VERBOSE=true

await addDocumentsFromPath('./docs');
const results = await search('debug query');
```

This will output detailed timing information, document counts, and internal processing steps.