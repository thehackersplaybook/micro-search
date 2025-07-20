# Getting Started with @microsearch/lightning

Lightning fast text search for Node.js - blazing fast markdown and text search engine.

## Quick Start

### Installation

```bash
npm install @microsearch/lightning
```

### Basic Usage

```javascript
import { search, addDocumentsFromPath } from '@microsearch/lightning';

// Load and index documents from a directory
await addDocumentsFromPath('./docs');

// Search for documents
const results = await search('your search query');
console.log(results);
```

## Step-by-Step Tutorial

### 1. Setting Up Your Project

Create a new Node.js project..

```bash
mkdir my-search-app
cd my-search-app
npm init -y
npm install @microsearch/lightning
```

### 2. Basic Document Search

Create an `index.js` file..

```javascript
import { addDocumentsFromPath, search, clearIndex } from '@microsearch/lightning';

async function main() {
  try {
    // Clear any existing index
    clearIndex();
    
    // Load documents from a directory
    await addDocumentsFromPath('./documents');
    
    // Perform a search
    const results = await search('JavaScript', { limit: 5 });
    
    // Display results
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   Path: ${result.path}`);
      console.log(`   Score: ${result.score.toFixed(3)}`);
      console.log(`   Snippet: ${result.snippet}`);
      console.log('');
    });
  } catch (error) {
    console.error('Search failed:', error);
  }
}

main();
```

### 3. Configuration

Create a `.env` file in your project root..

```env
ROOT_DOCS_FOLDER=./documents
MAX_DOCS=10000
SEARCH_MAX_RESULTS=10
VERBOSE=false
ALLOW_PHRASE_SEARCH=true
TIMEOUT_WARN_MS=100
TOKENIZATION_MODE=word
SNIPPET_LENGTH=150
```

### 4. Advanced Usage

```javascript
import { 
  addDocumentsFromPath, 
  search, 
  clearIndex,
  getVersionInfo 
} from '@microsearch/lightning';

async function advancedSearch() {
  // Load documents
  await addDocumentsFromPath('./markdown-docs');
  
  // Search with options
  const results = await search('machine learning algorithms', {
    limit: 20
  });
  
  // Filter results by score
  const highQualityResults = results.filter(result => result.score > 0.5);
  
  console.log(`Found ${highQualityResults.length} high-quality matches`);
  
  // Get version information
  const version = getVersionInfo();
  console.log(`Using @microsearch/lightning v${version.version}`);
}
```

## Working with Different File Types

### Markdown Files

```javascript
// Automatically handles frontmatter
await addDocumentsFromPath('./blog-posts');
const blogResults = await search('react hooks tutorial');
```

### Plain Text Files

```javascript
// Works with any text-based files
await addDocumentsFromPath('./text-documents');
const textResults = await search('configuration guide');
```

## Performance Tips

1. **Batch Loading**: Load all documents at once rather than one by one..
2. **Index Reuse**: Only call `clearIndex()` when necessary..
3. **Query Optimization**: Use specific terms for better performance..
4. **Memory Management**: Monitor memory usage with large datasets..

## Error Handling

```javascript
import { addDocumentsFromPath, search } from '@microsearch/lightning';

async function robustSearch(query) {
  try {
    await addDocumentsFromPath('./docs');
    const results = await search(query);
    return results;
  } catch (error) {
    if (error.message.includes('Directory not found')) {
      console.error('Documents directory does not exist');
    } else if (error.message.includes('No documents found')) {
      console.error('No documents to search');
    } else {
      console.error('Unexpected error:', error);
    }
    return [];
  }
}
```

## Next Steps

- Read the [API Reference](./API_REFERENCE.md) for detailed function documentation.
- Check out [Usage Examples](./USAGE.md) for more complex scenarios.
- Learn about [Configuration](./USAGE.md#configuration) options.
- See [Performance Benchmarks](../benchmarks/rev000A/) for comparison data.

## Common Issues

### Issue: "Cannot find module" Error
**Solution**: Ensure you're using ES modules in your `package.json`.
```json
{
  "type": "module"
}
```

### Issue: No Results Found
**Solution**: 
1. Verify the documents directory exists..
2. Check that files contain searchable text..
3. Try broader search terms..

### Issue: Slow Performance
**Solution**:
1. Reduce the number of documents with `MAX_DOCS`..
2. Enable logging to identify bottlenecks..
3. Consider using more specific search queries..

## Support

- [GitHub Issues](https://github.com/microsearch/lightning/issues)
- [Documentation](https://github.com/microsearch/lightning#readme)
- Email: contact@microsearch.io