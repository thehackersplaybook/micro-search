# ⚡ @microsearch/lightning

> Lightning fast text search for Node.js - blazing fast markdown and text search engine

## 🚀 Overview

`@microsearch/lightning` is a native, in-memory Node.js/TypeScript text search engine designed for Markdown or plain text documents. It aims to provide blazing-fast keyword and phrase search across large datasets (up to 1GB RAM), delivering accurate, ranked search results in **<100ms** per query on modern hardware.

## ✨ Features

- **In-Memory Indexing**: Fast, efficient indexing of text content.
- **Keyword & Phrase Search**: Supports exact and partial matches.
- **Ranked Results**: Basic ranking based on term frequency.
- **Configurable**: Easily adjust settings via a `.env` file.
- **Benchmarking**: Compare performance against popular libraries.
- **Logging**: Detailed and colored CLI output using `chalk`.

## 📁 Project Structure

```
microsearch/
├── src/
│   ├── core/              # Core search engine implementation
│   ├── cli/               # CLI entrypoint (planned for later)
│   ├── utils/             # Helper modules (file loaders, parsers, etc.)
│   ├── config/            # Configuration loader
│   ├── logger/            # Logging utilities
│   ├── metrics/           # Metrics and benchmarking
│   └── index.ts           # Exports core API
├── benchmarks/            # Benchmark scripts, data & comparison results
├── tests/                 # Unit tests
├── .env                   # Project configuration
├── .eslintrc.js           # Lint rules
├── .prettierrc            # Code style
├── tsconfig.json          # TypeScript config
├── package.json
├── README.md
└── LICENSE
```

## ⚙️ Installation

```bash
npm install @microsearch/lightning
```

### Development Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/microsearch/lightning.git
   cd lightning
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## 🚀 Usage

```javascript
import { search, addDocumentsFromPath } from '@microsearch/lightning';

// Load and index documents
await addDocumentsFromPath('./docs');

// Search for documents
const results = await search('your search query');
console.log(results);
```

## ⚙️ Configuration

Configure the project by modifying the `.env` file in the root directory. A sample `.env` is provided:

```env
ROOT_DOCS_FOLDER=./data/markdown
MAX_DOCS=100000
SEARCH_MAX_RESULTS=10
METRICS_FILE=./metrics/search-benchmarks.json
BENCHMARK_RUNS=1000
VERBOSE=false
ALLOW_FUZZY_SEARCH=false
ALLOW_PHRASE_SEARCH=true
TIMEOUT_WARN_MS=100
```

### Running Tests

```bash
npm test
```

### Running Benchmarks

```bash
npm run benchmark
```

## 📝 API Surface (Initial)

```ts
interface SearchDocument {
  id: string | number;
  title: string;
  content: string;
}

interface SearchResult {
  docId: string | number;
  title: string;
  path: string;
  snippet: string;
  score: number;
}

export async function addDocumentsFromPath(path: string): Promise<void> {
  // ...
}

export async function search(
  query: string,
  opts?: SearchOptions
): Promise<SearchResult[]> {
  // ...
}

export function clearIndex(): void {
  // ...
}
```