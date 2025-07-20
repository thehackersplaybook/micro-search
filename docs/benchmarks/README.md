# @microsearch/lightning Benchmarks

This directory contains comprehensive benchmark results comparing @microsearch/lightning against other JavaScript search libraries..

## 🚀 Latest Results

**Current Revision:** [rev000B](./rev000B/) - Performance Optimization Release.  
**Benchmark Date:** July 21, 2025.  
**Performance Rank:** 3rd out of 4 libraries tested.  

### Quick Performance Summary

| Library | Avg Latency | Memory Usage | Rank |
|---------|-------------|--------------|------|
| **FlexSearch** | 5μs | 28.6MB | 🥇 1st |
| **MiniSearch** | 61μs | 34.6MB | 🥈 2nd |
| **@microsearch/lightning** | 2,358μs | 34.1MB | 🥉 3rd |
| **Fuse.js** | 3,186μs | 34.4MB | 4th |

## 📋 Revision History

| Revision | Date | Description | Avg Latency | Change | Status |
|----------|------|-------------|-------------|--------|--------|
| [rev000B](./rev000B/) | 2025-07-21 | Performance optimizations | 2,358μs | +11.0% | **Current** |
| [rev000A](./rev000A/) | 2025-07-20 | Baseline implementation | 2,125μs | - | Archived |

## 🔍 Key Insights

### Performance Characteristics
- **@microsearch/lightning excels in memory efficiency** - uses 0.6MB less memory than competitors
- **FlexSearch dominates in raw speed** with sub-microsecond search times
- **Scenario-dependent performance** varies significantly across query types
- **Optimization framework established** for future performance improvements

### rev000B Optimization Results
✅ **Improvements in 3/5 scenarios:**
- Two Terms: 5.6% faster
- Common Terms: 6.7% faster  
- Rare Terms: 4.2% faster

❌ **Regressions in 2/5 scenarios:**
- Single Term: 23.2% slower
- Complex Phrases: 28.0% slower

## 📊 Benchmark Methodology

**Test Environment:**
- Platform: darwin arm64
- Node.js: v22.15.1
- Dataset: 130 markdown documents (~191,000 words)
- Query scenarios: 5 different search patterns
- Iterations: 100 searches per scenario per library

**Measured Metrics:**
- Search latency (microseconds for precision)
- Memory usage (MB)
- Statistical analysis (min, max, avg, P95, P99)
- Cross-library performance ranking

## 📁 Directory Structure

```
docs/benchmarks/
├── README.md                    # This overview document
├── BENCHMARK_CONVENTIONS.md     # Versioning and methodology standards
├── BENCHMARK_RESULTS.md         # Latest detailed benchmark report  
├── latest-results.json          # Machine-readable latest results
├── rev000A/                     # Baseline implementation
│   ├── README.md
│   ├── BENCHMARK_RESULTS.md
│   └── latest-results.json
├── rev000B/                     # Performance optimization release  
│   ├── README.md
│   ├── BENCHMARK_RESULTS.md
│   ├── latest-results.json
│   └── benchmark-results-*.json
└── archive/                     # Historical run data
    └── benchmark-results-*.json
```

## 🎯 Performance Goals

**Short-term (next revision):**
- Target 15-25% latency improvement
- Optimize single-term query performance
- Reduce memory footprint by 5-10%

**Long-term objectives:**
- Achieve sub-millisecond average latency
- Maintain memory efficiency advantage
- Establish top-2 performance ranking

## 🔧 Running Benchmarks

```bash
# Run comprehensive benchmark suite
npm run benchmark:comprehensive

# Run basic benchmarks  
npm run benchmark

# View latest results
cat docs/benchmarks/latest-results.json | jq '.summary'
```

## 📖 Further Reading

- [Benchmark Conventions](./BENCHMARK_CONVENTIONS.md) - Detailed methodology and standards
- [Latest Results](./BENCHMARK_RESULTS.md) - Comprehensive current benchmark report
- [Performance Optimization Guide](../sources/) - Research papers and optimization techniques

---

**Last Updated:** July 21, 2025  
**Next Benchmark:** Scheduled for next performance optimization cycle