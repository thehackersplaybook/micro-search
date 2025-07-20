import { addDocumentsFromPath, search } from '../src/core/search';
import config from '../src/config';
import { info, error } from '../src/logger';
import fs from 'fs-extra';
import path from 'path';

interface BenchmarkResult {
  library: string;
  datasetSize: number;
  avgLatency: number;
  medianLatency: number;
  p99Latency: number;
  memoryUsageMB: number;
  timestamp: string;
}

async function runBenchmark() {
  info('benchmark', 'Starting benchmark run...');

  const results: BenchmarkResult[] = [];

  // Load documents
  const docsPath = path.resolve(__dirname, config.ROOT_DOCS_FOLDER);
  info('benchmark', `Loading documents from: ${docsPath}`);
  await addDocumentsFromPath(docsPath);
  info('benchmark', 'Documents loaded.');

  // Simple search benchmark
  const queries = ['test', 'document', 'repeated']; // Example queries
  const latencies: number[] = [];

  for (let i = 0; i < config.BENCHMARK_RUNS; i++) {
    const query = queries[Math.floor(Math.random() * queries.length)];
    const startTime = process.hrtime.bigint();
    await search(query);
    const endTime = process.hrtime.bigint();
    latencies.push(Number(endTime - startTime) / 1_000_000); // Convert nanoseconds to milliseconds
  }

  // Calculate metrics
  latencies.sort((a, b) => a - b);
  const avgLatency = latencies.reduce((sum, val) => sum + val, 0) / latencies.length;
  const medianLatency = latencies[Math.floor(latencies.length / 2)];
  const p99Latency = latencies[Math.floor(latencies.length * 0.99)];
  const memoryUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;

  const result: BenchmarkResult = {
    library: 'micro-search',
    datasetSize: 0, // TODO: Get actual dataset size
    avgLatency,
    medianLatency,
    p99Latency,
    memoryUsageMB,
    timestamp: new Date().toISOString(),
  };
  results.push(result);

  info('benchmark', 'Benchmark results:', result);

  // Write metrics to file
  const metricsFilePath = path.resolve(__dirname, '../', config.METRICS_FILE);
  await fs.ensureDir(path.dirname(metricsFilePath));
  await fs.writeJson(metricsFilePath, results, { spaces: 2 });
  info('benchmark', `Metrics written to: ${metricsFilePath}`);

  // TODO: Add comparison with other libraries
}

runBenchmark().catch(err => {
  error('benchmark', 'Benchmark failed:', err);
});
