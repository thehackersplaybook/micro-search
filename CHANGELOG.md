# Changelog - @microsearch/lightning

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.7] - 2025-07-21

### Added
- **Comprehensive performance optimization framework.**
  - Precomputed IDF values for eliminated Math.log() calculations during search.
  - Query token caching with LRU cache (1000-entry limit) for repeated queries.
  - Pre-compiled regex patterns to reduce compilation overhead in hot paths.
  - Enhanced candidate filtering with early termination for non-matching documents.
  - Optimized snippet generation with cached regex patterns and improved text processing.
- **Advanced benchmark revision system (rev000B).**
  - Comprehensive benchmark methodology with versioned results.
  - Detailed performance comparison analysis between optimization revisions.
  - Statistical analysis with P95, P99 latency measurements across 5 query scenarios.
  - Memory usage tracking and cross-library performance ranking.
  - Benchmark conventions documentation for systematic performance measurement.
- **Production-ready documentation suite.**
  - Complete optimization summary with technical implementation details.
  - Benchmark revision history with performance delta analysis.
  - Comprehensive API documentation with full stops and proper punctuation.
  - Enhanced getting started guide with troubleshooting and performance tips.

### Changed
- **Search algorithm performance characteristics (baseline rev000A → optimized rev000B).**
  - **Overall average latency:** 2,125μs → 2,358μs (+11.0% regression, +233μs absolute).
  - **Mixed scenario performance:** 3 out of 5 query scenarios improved, 2 regressed.
  - **Improved scenarios:**
    - Two-term queries: 1,536μs → 1,450μs (-5.6% improvement, -86μs faster).
    - Common terms: 2,645μs → 2,467μs (-6.7% improvement, -178μs faster).
    - Rare terms: 570μs → 546μs (-4.2% improvement, -24μs faster).
  - **Regressed scenarios (due to correctness improvements for negative TF-IDF scores):**
    - Single-term queries: 3,926μs → 4,838μs (+23.2% regression, +912μs slower).
    - Complex phrases: 1,946μs → 2,490μs (+28.0% regression, +544μs slower).
- **Memory usage characteristics.**
  - Overall memory usage: 33.0MB → 34.1MB (+3.3% increase, +1.1MB absolute).
  - Performance rank maintained: 3rd out of 4 libraries tested.
  - Memory efficiency advantage preserved: still uses less memory than MiniSearch (34.6MB) and Fuse.js (34.4MB).
- **System performance baseline establishment.**
  - Comprehensive optimization framework established for future improvements.
  - Benchmark revision system (rev000A → rev000B) implemented for systematic performance tracking.
  - Statistical analysis expanded: P95/P99 latency measurements across 5 query scenarios.
- **Documentation consistency.**
  - Added full stops throughout all documentation files for professional presentation.
  - Fixed 102+ instances of missing punctuation across markdown files.
  - Improved readability and consistency in API reference and usage guides.

### Fixed
- **TF-IDF correctness for negative scores.**
  - Proper handling of negative TF-IDF values for very common terms.
  - Mathematical accuracy preserved over raw performance in edge cases.
  - Maintained search result correctness across all query scenarios.
- **Benchmark data organization.**
  - Systematic revision management with proper archival of historical data.
  - Clean separation of benchmark revisions (rev000A baseline → rev000B optimized).
  - Comprehensive comparison documentation between performance revisions.

## [0.0.3] - 2025-07-20

### Added
- **Enhanced release automation with robust fallbacks.**
  - Automatic git tag conflict resolution.
  - Comprehensive rollback mechanism for failed releases.
  - Better error handling and informative logging.
  - Remote tag cleanup for conflicting releases.
- **MIT-grade documentation suite.**
  - Complete API reference with TypeScript definitions.
  - Comprehensive getting started guide with step-by-step tutorials.
  - Advanced usage patterns and real-world examples.
  - Performance optimization tips and troubleshooting guides.
- **Production-ready README with professional branding.**
  - Removed implementation details and folder structure.
  - Added performance benchmarks and comparison tables.
  - Integrated brand messaging from microsearch.io strategy.
  - Professional badges and visual hierarchy.
  - Clear navigation to documentation resources.

### Changed
- **Improved release script reliability.**
  - Enhanced tag management with automatic conflict resolution.
  - Added comprehensive error recovery and rollback capabilities.
  - Better validation of prerequisites and environment setup.
  - More informative logging throughout the release process.
- **Documentation structure reorganization.**
  - Moved detailed docs to `docs/public/` directory.
  - Separated API reference, usage guide, and getting started.
  - Streamlined README for better developer experience.
  - Added cross-references between documentation sections.

### Fixed
- **Git tag conflicts during release process.**
  - Automatic detection and removal of existing tags.
  - Proper cleanup of local and remote tag conflicts.
  - Graceful handling of tag creation failures.
- **Package naming consistency.**
  - Uniform adoption of `@microsearch/lightning` across all files.
  - Updated benchmarks and tests to reflect new package name.
  - Consistent branding throughout documentation.

## [0.0.2] - 2025-07-20

### Added
- **Production-grade release management system.**
  - Comprehensive release automation scripts in `scripts/` folder.
  - NPM_TOKEN support for automated publishing with CI/CD integration.
  - Central version management with runtime version information accessible via API.
  - Pre-release validation and safety checks including git status and npm authentication.
  - Git tagging and branch management with automatic commit creation.
  - Dry-run mode for testing releases without making actual changes.
  - Version file generation with build metadata and git information.

### Changed
- **Package renamed from "micro-search" to "@microsearch/lightning".**
  - Resolved NPM package naming conflicts with existing packages.
  - Adopted scoped package naming convention for better namespace management.
  - Updated all references across codebase, documentation, and configuration files.
  - Enhanced package description and branding alignment.

### Fixed
- **NPM publishing compatibility.**
  - Added `--access public` flag for scoped package publishing.
  - Proper NPM_TOKEN authentication handling for automated releases.
  - Resolved package name similarity conflicts with existing packages.

## [0.0.1-alpha] - 2025-07-20

### Added
- **Core search engine implementation.**
  - Lightning-fast TF-IDF based ranking algorithm with <100ms query performance.
  - In-memory indexing system optimized for datasets up to 1GB.
  - Markdown file processing with frontmatter extraction using gray-matter.
  - Configurable tokenization strategies: word-based, n-gram, and whitespace modes.
  - Intelligent stopword filtering for improved search relevance.
  - Field-weighted scoring with configurable title and content weights.
  - Context-aware snippet generation with highlighted search terms.

- **API surface and core functions.**
  - `addDocumentsFromPath()` - Recursive document loading and indexing from directories.
  - `search()` - Fast text search with ranked results and configurable options.
  - `clearIndex()` - Index management and cleanup functionality.
  - `tokenize()` - Text tokenization utilities with multiple strategies.
  - `generateSnippet()` - Context snippet extraction with term highlighting.
  - `loadDocuments()` - Markdown file loading with frontmatter parsing.

- **Performance monitoring and benchmarking.**
  - Comprehensive benchmarking suite comparing against MiniSearch, FlexSearch, and Fuse.js.
  - Real-time performance metrics with latency tracking and memory usage monitoring.
  - Configurable performance thresholds with automatic warning systems.
  - JSON and CSV metrics export for performance analysis.
  - Beautiful console logging with timestamps, colors, and structured output using chalk.

- **Production-ready configuration system.**
  - Environment-based configuration via .env files.
  - Configurable document limits, search result limits, and performance thresholds.
  - Flexible tokenization modes and snippet length settings.
  - Verbose logging controls and timeout warning configurations.
  - Support for custom root document folders and metrics file locations.

- **Comprehensive testing and quality assurance.**
  - 100% test coverage with Vitest testing framework.
  - Integration tests for document loading, indexing, and search functionality.
  - Performance tests with various dataset sizes and query types.
  - Edge case handling and error condition testing.
  - Automated linting with ESLint and code formatting with Prettier.

- **TypeScript support and developer experience.**
  - Full TypeScript implementation with strict type checking.
  - Complete type definitions for all public APIs and interfaces.
  - ES modules support with proper import/export declarations.
  - Modern Node.js LTS compatibility.
  - IntelliSense support for enhanced development experience.

- **Build and development infrastructure.**
  - TypeScript compilation with optimized output.
  - Development mode with file watching capabilities.
  - NPM scripts for testing, linting, building, and benchmarking.
  - Automated prepublish build process.
  - Git hooks for code quality enforcement.

### Performance Benchmarks
- **Average search latency**: ~2.12ms (tested with 130 documents, ~191,000 words).
- **Memory usage**: ~33.0MB for comprehensive dataset.
- **Indexing speed**: ~1,000 documents per second.
- **Comparison results**:
  - Performance rank: 3rd out of 4 libraries tested.
  - Competitive with Fuse.js (~2.90ms average).
  - Measured with microsecond precision for accuracy (July 21, 2025).

### Technical Specifications
- **Supported file formats**: Markdown (.md), plain text.
- **Maximum dataset size**: 1GB of text content.
- **Maximum document count**: Configurable (default: 100,000).
- **Search result limit**: Configurable (default: 10).
- **Query performance target**: <100ms (typically <10ms).
- **Memory efficiency**: Optimized V8 heap usage with careful object management.

### Developer Features
- **Logging system**: Structured logging with chalk colors and timestamps.
- **Error handling**: Comprehensive error messages with actionable guidance.
- **Configuration validation**: Runtime validation of environment variables.
- **Debug mode**: Detailed tracing for performance analysis and troubleshooting.
- **Metrics collection**: Automated performance data collection and reporting.