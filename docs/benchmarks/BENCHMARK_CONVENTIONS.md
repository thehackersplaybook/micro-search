# Benchmark Conventions - @microsearch/lightning

This document outlines the versioning and organization conventions for benchmark results in the @microsearch/lightning project..

## Directory Structure

All benchmark results are organized in revision folders under `docs/benchmarks/` using the following convention:

```
docs/benchmarks/
├── BENCHMARK_CONVENTIONS.md          # This document
├── README.md                         # Current benchmark overview
├── rev000A/                         # First revision
│   ├── BENCHMARK_RESULTS.md         # Detailed benchmark report
│   ├── latest-results.json          # JSON data for this revision
│   └── benchmark-results-*.json     # Historical run data
├── rev000B/                         # Second revision
├── rev000C/                         # Third revision
...
├── rev000Z/                         # 26th revision
├── rev00AA/                         # 27th revision
├── rev00AB/                         # 28th revision
...
```

## Revision Naming Convention

### Format: `revXXXY`

- **XXX**: Zero-padded numeric prefix (000, 001, 002, etc.)
- **Y**: Single alphabetic character (A-Z)

### Sequence Examples:

1. **rev000A** - First revision
2. **rev000B** - Second revision
3. **rev000C** - Third revision
...
26. **rev000Z** - 26th revision
27. **rev00AA** - 27th revision
28. **rev00AB** - 28th revision
29. **rev00AC** - 29th revision
...
52. **rev00AZ** - 52nd revision
53. **rev00BA** - 53rd revision
...
702. **rev00ZZ** - 702nd revision
703. **rev01AA** - 703rd revision

### Progression Logic:

- Start with **000A**
- Increment the letter: **A → B → C → ... → Z**
- When reaching **Z**, increment the second letter: **000Z → 00AA**
- Continue with double letters: **AA → AB → AC → ... → AZ → BA → BB → ...**
- When reaching **ZZ**, increment the numeric prefix: **00ZZ → 01AA**

## When to Create New Revisions

Create a new revision folder when:

1. **Significant methodology changes** - Different test datasets, query patterns, or measurement approaches
2. **Library version updates** - New versions of @microsearch/lightning or comparison libraries
3. **Performance optimizations** - Code changes that may impact benchmark results
4. **Environment changes** - Different hardware, Node.js versions, or operating systems
5. **Bug fixes** - Corrections to benchmark logic or measurement accuracy

## Revision Contents

Each revision folder must contain:

### Required Files:

- **BENCHMARK_RESULTS.md** - Human-readable benchmark report with:
  - Executive summary
  - Performance analysis
  - Detailed results by scenario
  - Methodology description
  - Recommendations
  - Date and environment information

- **latest-results.json** - Machine-readable benchmark data with:
  - Metadata (timestamp, platform, Node.js version)
  - Raw performance metrics
  - Statistical analysis (min, max, avg, percentiles)
  - Memory usage data

### Optional Files:

- **benchmark-results-[timestamp].json** - Historical run data from multiple benchmark executions
- **README.md** - Revision-specific notes or changes (if needed)
- **NOTES.md** - Additional context or observations for this revision

## Data Format Standards

### Timestamp Format:
ISO 8601 format: `YYYY-MM-DDTHH-mm-ss-sssZ`

Example: `benchmark-results-2025-07-20T23-09-11-487Z.json`

### Metric Units:
- **Latency**: Microseconds (μs) for precision
- **Memory**: Megabytes (MB) to 2 decimal places
- **Throughput**: Operations per second (ops/sec)

### Statistical Measures:
- **min**: Minimum value observed
- **max**: Maximum value observed
- **avg**: Arithmetic mean
- **median**: 50th percentile
- **p90**: 90th percentile
- **p95**: 95th percentile
- **p99**: 99th percentile

## Revision Management

### Creating a New Revision:

1. Determine the next revision identifier using the naming convention
2. Create the revision directory: `mkdir docs/benchmarks/rev000B`
3. Run benchmarks and generate new results
4. Create required files in the new revision folder
5. Update the main `README.md` to reference the latest revision

### Archival Policy:

- **Keep all revisions** for historical comparison
- **Archive old revisions** (move to `archived/` after 10+ revisions if needed)
- **Document breaking changes** in revision-specific notes

### Comparison Guidelines:

- Compare results only within the same major methodology
- Note environment differences when comparing across revisions
- Use statistical significance testing for performance claims

## Automation Integration

### CI/CD Pipeline:

- Automated benchmarks should create new revisions only for:
  - Release candidates
  - Major version changes
  - Scheduled monthly runs

### Naming in Automation:

```bash
# Example script for automatic revision creation
LAST_REV=$(ls docs/benchmarks/rev* | sort | tail -1 | grep -o 'rev.*')
NEXT_REV=$(calculate_next_revision $LAST_REV)
mkdir "docs/benchmarks/$NEXT_REV"
```

## Historical Context

### Revision Log:

| Revision | Date | Description | Key Changes |
|----------|------|-------------|-------------|
| rev000A | 2025-07-20 | Initial benchmark implementation | Baseline performance with 130 documents, microsecond precision |
| rev000B | 2025-07-21 | Performance optimization release | Precomputed IDF, query caching, regex optimization, mixed results (+11.0% avg latency, 3/5 scenarios improved) |

## Best Practices

1. **Always document changes** between revisions
2. **Include environment information** in every benchmark
3. **Use consistent test datasets** when possible
4. **Archive supporting data** (test documents, scripts) with each revision
5. **Validate results** by running benchmarks multiple times
6. **Cross-reference** with version control commits

## Examples

### Creating Revision 000B:

```bash
cd docs/benchmarks
mkdir rev000B
npm run benchmark:comprehensive
mv latest-results.json rev000B/
# Edit and move BENCHMARK_RESULTS.md to rev000B/
```

### Finding Latest Revision:

```bash
# Get the most recent revision folder
ls docs/benchmarks/rev* | sort | tail -1
```

### Comparing Revisions:

```bash
# Compare performance between revisions
diff rev000A/BENCHMARK_RESULTS.md rev000B/BENCHMARK_RESULTS.md
```

---

This convention ensures systematic organization of benchmark data while maintaining historical context and enabling easy comparison across different versions and methodologies..