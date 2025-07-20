# ⚡ @microsearch/lightning

> **Planet-scale search, millisecond speed.**

Lightning-fast text search engine for Node.js built from the ground up for performance and simplicity. Index and search through thousands of markdown and text documents in under 100ms.

[![npm version](https://badge.fury.io/js/%40microsearch%2Flightning.svg)](https://badge.fury.io/js/%40microsearch%2Flightning)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Features

- **Blazing Fast**: Search queries complete in <100ms across thousands of documents.
- **Zero Dependencies**: Lightweight core with no external search dependencies.
- **TypeScript Native**: Built in TypeScript with full type safety and IntelliSense support.
- **Markdown Optimized**: Parse frontmatter, extract clean text, and index with intelligent ranking.
- **Production Ready**: Battle-tested with comprehensive error handling and performance monitoring.
- **Configurable**: Fine-tune tokenization, ranking weights, and performance thresholds.
- **Memory Efficient**: Optimized in-memory indexing for datasets up to 1GB.

## 📦 Installation

```bash
npm install @microsearch/lightning
```

## ⚡ Quick Start

```javascript
import { addDocumentsFromPath, search } from '@microsearch/lightning';

// Index your documents
await addDocumentsFromPath('./documentation');

// Search with lightning speed
const results = await search('API authentication');

// Use the results
results.forEach(result => {
  console.log(`📄 ${result.title}`);
  console.log(`⭐ Score: ${result.score}`);
  console.log(`💬 ${result.snippet}`);
});
```

## 🎯 Core API

| Function | Description |
|----------|-------------|
| `addDocumentsFromPath(path)` | Index all documents from a directory. |
| `search(query, options?)` | Search indexed documents with ranking. |
| `clearIndex()` | Clear the current search index. |
| `getVersionInfo()` | Get version and build information. |

**[📚 Complete API Reference →](./docs/public/API_REFERENCE.md)**

## 📖 Documentation

- **[🚀 Getting Started](./docs/public/GET_STARTED.md)** - Installation, setup, and first search.
- **[📖 Usage Guide](./docs/public/USAGE.md)** - Advanced patterns and best practices.
- **[📋 API Reference](./docs/public/API_REFERENCE.md)** - Complete function documentation.
- **[📊 Benchmarks](./docs/benchmarks/rev000A/BENCHMARK_RESULTS.md)** - Performance comparisons and metrics.

## ⚙️ Configuration

Create a `.env` file to customize behavior:

```env
ROOT_DOCS_FOLDER=./documents
MAX_DOCS=10000
SEARCH_MAX_RESULTS=10
TOKENIZATION_MODE=word
SNIPPET_LENGTH=150
TIMEOUT_WARN_MS=100
VERBOSE=false
```

## 🔥 Performance

@microsearch/lightning is engineered for comprehensive search capabilities:

| Metric | Performance |
|--------|-------------|
| **Search Speed** | ~2.12ms average latency |
| **Memory Efficiency** | ~33.0MB for 130 documents |
| **Indexing Speed** | ~1,000 docs/second |
| **Supported Dataset** | Up to 1GB text content |

### Benchmark Results

Comprehensive benchmarks against popular JavaScript search libraries with 130 documents (~191,000 words):

```
Library               Avg Latency    Memory Usage    Performance Rank
FlexSearch                  4μs         30.8MB             1
MiniSearch                 57μs         30.6MB             2  
@microsearch/lightning  2,125μs         33.0MB             3
Fuse.js                 2,902μs         33.1MB             4
```

*Benchmarked on July 21, 2025 using microsecond-precision timing.*

**[📊 View Complete Benchmarks →](./docs/benchmarks/rev000A/BENCHMARK_RESULTS.md)**

## 🛠️ Advanced Usage

### Field-Specific Search

```javascript
const results = await search('React tutorial', {
  fields: ['title', 'content'],  // Search in specific fields
  limit: 20
});
```

### Real-time Search

```javascript
import { search } from '@microsearch/lightning';

// Debounced search for live interfaces
const debouncedSearch = debounce(async (query) => {
  const results = await search(query, { limit: 8 });
  updateSearchResults(results);
}, 300);
```

### Multiple Document Sources

```javascript
// Index from multiple directories
const sources = ['./docs', './articles', './tutorials'];
for (const source of sources) {
  await addDocumentsFromPath(source);
}

const results = await search('installation guide');
```

## 🧪 Development

### Running Tests

```bash
npm test              # Run test suite
npm run test:coverage # Generate coverage report
npm run lint          # Check code quality
```

### Benchmarking

```bash
npm run benchmark     # Compare against other libraries
```

### Building

```bash
npm run build         # Compile TypeScript
npm run dev           # Development mode with watching
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m 'Add amazing feature'`.
4. Push to the branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

## 📄 License

MIT License - see the [LICENSE](./LICENSE) file for details..

## 🏢 About

@microsearch/lightning is developed by [The Hackers Playbook Labs](https://www.thehackersplaybook.org) as part of the Microsearch ecosystem. Our mission is to advance human consciousness through the seamless integration of programming, knowledge, and mindfulness..

**Learn More:**
- 🌐 Website: [microsearch.io](https://microsearch.io)
- 📧 Email: [contact@microsearch.io](mailto:contact@microsearch.io)  
- 🐙 GitHub: [github.com/microsearch/lightning](https://github.com/microsearch/lightning)
- 🐦 Twitter: [@microsearchio](https://twitter.com/microsearchio)

## 🙏 Acknowledgments

- Inspired by [MiniSearch](https://github.com/lucaong/minisearch), [FlexSearch](https://github.com/nextapps-de/flexsearch), and [Fuse.js](https://github.com/krisk/Fuse).
- Built with ❤️ using TypeScript, Vitest, and modern Node.js.
- Performance optimized using V8 engine insights and careful memory management.

---

**"Find. Discover. Build. At the speed of thought."** ⚡