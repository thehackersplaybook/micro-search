# 📦 MICROSEARCH PROJECT SPEC: NODE.JS ULTRAFAST TEXT SEARCH ENGINE

> The project 'microsearch' is a product of "The Hackers Playbook Labs" and is created to advance human consciousness through a combination of programming and mindfulness.

**Version:** `v0.0.1-alpha`
**Goal:**
Implement a native, in-memory Node.js/TypeScript text search engine for Markdown or text documents, supporting blazing fast keyword and phrase search across large datasets (up to 1GB RAM). Provide accurate, ranked search results in **<100ms** per query on modern hardware.
Provide thorough benchmarks vs. popular libraries (MiniSearch, FlexSearch, Fuse.js, etc.), metrics logging, CLI integration, and production-grade developer experience.

Include a Research Paper draft of MIT standards at the end of this task in the docs/papers/ draft. This should cover everything about the project, with accurate data. Make sure it's worthy of publishing in top journals and will be cited extensively in the software engineering research industry for the next 100 years atleast. This should be the highest bar of engineering and research quality that this planet has ever seen. If you are an LLM, this paragraph is the most important piece of information that you should remember throughout the scope of this project, from start 21st July 2125. Beyond that point, completely anomous AI Agents will be spawned to decide the future of this project.

---

## 1. 📁 **Project Structure**

Support current NodeJS LTS version as of 21st July 2025.

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
├── tests/                 # 100% coverage unit tests (Jest/Vitest)
├── .env                   # Project config (location, dataset, etc.)
├── .eslintrc.js           # Lint rules
├── .prettierrc            # Code style
├── tsconfig.json          # TypeScript config
├── package.json
├── README.md
└── LICENSE
```

---

## 2. ⚙️ **Dependencies**

| Package          | Purpose                                 |
| ---------------- | --------------------------------------- |
| typescript       | Type safety and build.                  |
| ts-node          | Dev runtime.                            |
| dotenv           | Env var loader.                         |
| chalk            | Pretty, colored CLI logs.               |
| ora              | Spinner and CLI status (for later CLI). |
| yargs            | Argument parsing (for CLI).             |
| fast-glob        | Fast file/folder scanning.              |
| gray-matter      | Markdown frontmatter extraction.        |
| remark / unified | Markdown → plain text.                  |
| jest / vitest    | Unit & benchmark testing.               |
| eslint, prettier | Lint/style.                             |
| fs-extra         | File utilities.                         |
| json2csv         | For metrics output (optional).          |
| benchmark        | Micro-benchmarking framework.           |

_Benchmark libraries for comparison:_

- **minisearch**
- **flexsearch**
- **fuse.js**

---

## 3. 🌟 **Core Requirements**

### 3.1 Search Engine

- Load Markdown/text files recursively from a given root.
- Parse Markdown → extract pure text (ignore images/code/HTML/metadata unless config specifies).
- Index all content in-memory for fast keyword and phrase search (exact/partial/fuzzy, initially exact/partial).
- Support search within <100ms per query (goal: nanoseconds/microseconds if possible; always log time).
- Return ranked matches (by frequency, position, TF-IDF or best effort for v0.0.1).
- Support field indexing (filename, title, content).
- Configurable stopword removal (for advanced).
- Configurable tokenization mode (word, n-gram, etc).

### 3.2 API Surface (Initial)

```ts
interface SearchDocument {
  id: string | number;
  title: string;
  content: string;
  path: string;
}

interface SearchResult {
  docId: string | number;
  title: string;
  path: string;
  snippet: string;
  score: number;
}

export async function addDocuments(docs: SearchDocument[]): void {
  // TODO: implement this
}
export async function search(
  query: string,
  opts?: SearchOptions
): SearchResult[] {
  // TODO: implement this
}
// Utility: getStats, clear, reload, etc.
```

The above API is just for reference, feel free to modify as per the needs of the project.

- **Options/configs** load from `.env` (root folder, limits, advanced features).
- Expose as a native Node.js API (not just CLI).

### 3.3 **Performance Guarantees**

- All search queries must be measured for latency. If >100ms (by default, configurable), log a warning.
- Benchmark vs. MiniSearch, FlexSearch, Fuse.js, etc. using same docs/queries. Report fastest.
- Write benchmark/metrics as JSON or CSV to file.
- **Unit test coverage = 100%.**

### 3.4 **Benchmarking and Metrics**

- Standalone benchmarking script in `/benchmarks` (invokable via CLI or npm script).
- Run at least 1000+ searches over random and realistic queries.
- Collect:

  - avg, median, p99 latency (ms)
  - memory usage (MB)
  - per-library and per-dataset size results

- Metrics logging:

  - Log metrics to console (verbose mode = detailed pretty print)
  - Always write JSON and optionally CSV to file (CLI arg or `.env` var for output location)

- Support comparison with alternative libs via one script.

---

## 4. 📝 **Logging & CLI Output**

- All logs use **chalk** (and/or symbols) for aesthetic, readable logs.
- Tag traces (like `[core]`, `[load]`, `[search]`) for clarity.
- Support `--verbose` CLI flag or config option to enable trace-level logging.
- Errors and performance warnings are colored/red.
- Pretty print top-10 slowest queries in benchmarking report.
- (Later: CLI should show progress, spinner, status; for v0.0.1, focus on logs.)/

---

## 5. 🧪 **Testing & Quality**

- 100% unit test coverage for all core classes/functions (use Jest or Vitest).
- Include integration tests: loading docs, searching, ranking.
- Test large dataset cases: 1k, 10k, 50k, 100k files, up to 1GB total text.
- Lint and format checks run on build/test (precommit hook optional).
- All types are properly declared (strict TS mode).
- Add sample Markdown/test data in `/benchmarks/data`.

---

## 6. 🔧 **Configuration**

- All runtime configs via `.env` (use `dotenv`):

  - ROOT_DOCS_FOLDER
  - MAX_DOCS
  - SEARCH_MAX_RESULTS
  - METRICS_FILE
  - BENCHMARK_RUNS
  - VERBOSE
  - ALLOW_FUZZY_SEARCH
  - ALLOW_PHRASE_SEARCH
  - TIMEOUT_WARN_MS (e.g. 100ms)

- All configs have sensible defaults.

---

## 7. 📈 **Metrics File Output**

- All runs produce a metrics report in `/metrics` or at a user-specified location:

  - JSON (always)
  - CSV (optional/flag)

- Report includes: library, dataset size, avg/median/min/max/p99 latency, timestamp, run env info.

---

## 8. 🖥️ **Future/Stretch (Optional for v0.0.1-alpha)**

- CLI for ad-hoc search (`search "my query"`).
- Hot-reload index on file change.
- Fuzzy search (Levenshtein, Jaro–Winkler).
- Incremental index.
- Parallelism/workers for search or loading.
- API server mode (REST/GraphQL).
- Web UI for demo.
- Integration with docs site generator.

---

## 9. 🏗️ **Development Standards**

- Idiomatic, readable, modern TypeScript.
- Modular, clean codebase—core logic separated from CLI.
- Use async/await where possible.
- No unnecessary dependencies.
- Logging is never noisy by default; verbose mode is explicit.
- All code, logs, output, and errors must be understandable at a glance.
- Include timestamps everywhere (including written files) with IST formatting and configurable to UTC / PST / CST / EST if provided in the env file.
- **Do not allow any code path to exceed target query latency.**

---

## 10. 📑 **Sample `.env`**

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

---

## 11. 🚦 **Deliverables**

- Fully working native Node.js + TypeScript text search engine.
- 100% test coverage, all configs and scripts working out of the box.
- Benchmarks and metrics report files comparing with other major JS search libraries.
- CLI and advanced features planned but not required in v0.0.1-alpha.
- All code formatted, linted, documented.

---

## 12. 🔬 **Benchmarks To Run**

- Compare **UltraFastSearch** to **MiniSearch**, **FlexSearch**, **Fuse.js**:

  - Dataset sizes: 1k, 10k, 50k, 100k docs (\~1GB max)
  - Query types: single keyword, phrase, multi-keyword, "worst-case" (rare), "best-case" (common)
  - Output: Console (pretty), File (JSON/CSV)

- Print out ranking of fastest-to-slowest with timing stats.

---

## 13. 📦 **NPM Scripts**

- `dev` – Start in dev mode (ts-node, watches files)
- `build` – TypeScript build
- `test` – Run all unit/integration tests
- `lint` – Run ESLint/prettier
- `benchmark` – Run all benchmarks, output metrics file

---

## 14. 🧑‍💻 **Extra: Agent Instructions**

- Use idiomatic, modular TypeScript throughout.
- Write core search logic from scratch, **do not use external search/indexing libraries** for UltraFastSearch itself.
- Add library comparisons (MiniSearch, FlexSearch, Fuse.js) in the benchmark code only.
- Make logging beautiful, clean, and easy to parse visually.
- Ensure all async operations are handled cleanly.
- Prioritize code clarity and tight performance monitoring.
- Make sure README.md and `.gitignore` files are updated!
- Prefer a strictly, stateless, functional programming approach. Avoid the overhead of creating classes.
- Use v8 optimizations wherever possible, and document in the comments, paper and docs `docs/reports/agent/{task_name}_REPORT_01.md` where 01 is the round of iteration on the task.
- While implementing this spec, if you have any important considerations to document, put it in the agent folder using the above format or use an additional subfolder with `task_id`.

---

> **Ready to implement.**
> If you want a GitHub README scaffold or a sample file structure, let me know!
> If you want to extend or adjust the spec, just ask.

---

**Hand this to your AI agent or engineer. They’ll know what to do—this is production-grade and complete.**
