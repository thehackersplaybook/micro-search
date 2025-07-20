import { addDocumentsFromPath, search, clearIndex } from '../src/core/search.js';
import config from '../src/config/index.js';
import { info, error } from '../src/logger/index.js';
import fs from 'fs-extra';
import path from 'path';
import MiniSearch from 'minisearch';
import FlexSearch from 'flexsearch';
import Fuse from 'fuse.js';
import { Parser as AsyncParser } from 'json2csv';

interface BenchmarkResult {
  library: string;
  datasetSize: number;
  avgLatency: number;
  medianLatency: number;
  p99Latency: number;
  memoryUsageMB: number;
  timestamp: string;
}

interface MiniSearchDoc {
  id: string;
  title: string;
  content: string;
  path: string;
  [key: string]: string; // Add index signature for FlexSearch
}

async function runBenchmark() {
  info('benchmark', 'Starting benchmark run...');

  const allResults: BenchmarkResult[] = [];

  // Load documents for all benchmarks
  const docsPath = config.ROOT_DOCS_FOLDER;
  info('benchmark', `Loading documents from: ${docsPath}`);
  const documents = await fs.readdir(docsPath);
  const datasetSize = documents.length;
  info('benchmark', `Loaded ${datasetSize} documents.`);

  // --- micro-search benchmark ---
  info('benchmark', 'Running micro-search benchmark...');
  clearIndex(); // Clear index before adding documents
  await addDocumentsFromPath(docsPath);

  const microSearchLatencies: number[] = [];
  const queries = ['test', 'document', 'repeated', 'another', 'word']; // Example queries

  for (let i = 0; i < config.BENCHMARK_RUNS; i++) {
    const query = queries[Math.floor(Math.random() * queries.length)];
    const startTime = process.hrtime.bigint();
    await search(query);
    const endTime = process.hrtime.bigint();
    microSearchLatencies.push(Number(endTime - startTime) / 1_000_000); // Convert nanoseconds to milliseconds
  }

  microSearchLatencies.sort((a, b) => a - b);
  const microSearchAvgLatency = microSearchLatencies.reduce((sum, val) => sum + val, 0) / microSearchLatencies.length;
  const microSearchMedianLatency = microSearchLatencies[Math.floor(microSearchLatencies.length / 2)];
  const microSearchP99Latency = microSearchLatencies[Math.floor(microSearchLatencies.length * 0.99)];
  const microSearchMemoryUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;

  allResults.push({
    library: 'micro-search',
    datasetSize,
    avgLatency: microSearchAvgLatency,
    medianLatency: microSearchMedianLatency,
    p99Latency: microSearchP99Latency,
    memoryUsageMB: microSearchMemoryUsageMB,
    timestamp: new Date().toISOString(),
  });
  info('benchmark', 'micro-search results:', allResults[0]);

  // --- MiniSearch benchmark ---
  info('benchmark', 'Running MiniSearch benchmark...');
  const miniSearch = new MiniSearch<MiniSearchDoc>({
    fields: ['title', 'content'],
    storeFields: ['title', 'path'],
  });
  const miniSearchDocs: MiniSearchDoc[] = [];
  for (const docName of documents) {
    const filePath = path.join(docsPath, docName);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    // Simplified parsing for benchmark, assuming content is plain text for now
    miniSearchDocs.push({
      id: filePath,
      title: docName.replace('.md', ''),
      content: fileContent,
      path: filePath,
    });
  }
  miniSearch.addAll(miniSearchDocs);

  const miniSearchLatencies: number[] = [];
  for (let i = 0; i < config.BENCHMARK_RUNS; i++) {
    const query = queries[Math.floor(Math.random() * queries.length)];
    const startTime = process.hrtime.bigint();
    miniSearch.search(query);
    const endTime = process.hrtime.bigint();
    miniSearchLatencies.push(Number(endTime - startTime) / 1_000_000);
  }

  miniSearchLatencies.sort((a, b) => a - b);
  const miniSearchAvgLatency = miniSearchLatencies.reduce((sum, val) => sum + val, 0) / miniSearchLatencies.length;
  const miniSearchMedianLatency = miniSearchLatencies[Math.floor(miniSearchLatencies.length / 2)];
  const miniSearchP99Latency = miniSearchLatencies[Math.floor(miniSearchLatencies.length * 0.99)];
  const miniSearchMemoryUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;

  allResults.push({
    library: 'minisearch',
    datasetSize,
    avgLatency: miniSearchAvgLatency,
    medianLatency: miniSearchMedianLatency,
    p99Latency: miniSearchP99Latency,
    memoryUsageMB: miniSearchMemoryUsageMB,
    timestamp: new Date().toISOString(),
  });
  info('benchmark', 'MiniSearch results:', allResults[1]);

  // --- FlexSearch benchmark ---
  info('benchmark', 'Running FlexSearch benchmark...');
  const flexSearch = new FlexSearch.Document({
    document: {
      id: 'id',
      index: ['title', 'content'],
    },
  });
  for (const doc of miniSearchDocs) {
    flexSearch.add(doc);
  }

  const flexSearchLatencies: number[] = [];
  for (let i = 0; i < config.BENCHMARK_RUNS; i++) {
    const query = queries[Math.floor(Math.random() * queries.length)];
    const startTime = process.hrtime.bigint();
    flexSearch.search(query);
    const endTime = process.hrtime.bigint();
    flexSearchLatencies.push(Number(endTime - startTime) / 1_000_000);
  }

  flexSearchLatencies.sort((a, b) => a - b);
  const flexSearchAvgLatency = flexSearchLatencies.reduce((sum, val) => sum + val, 0) / flexSearchLatencies.length;
  const flexSearchMedianLatency = flexSearchLatencies[Math.floor(flexSearchLatencies.length / 2)];
  const flexSearchP99Latency = flexSearchLatencies[Math.floor(flexSearchLatencies.length * 0.99)];
  const flexSearchMemoryUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;

  allResults.push({
    library: 'flexsearch',
    datasetSize,
    avgLatency: flexSearchAvgLatency,
    medianLatency: flexSearchMedianLatency,
    p99Latency: flexSearchP99Latency,
    memoryUsageMB: flexSearchMemoryUsageMB,
    timestamp: new Date().toISOString(),
  });
  info('benchmark', 'FlexSearch results:', allResults[2]);

  // --- Fuse.js benchmark ---
  info('benchmark', 'Running Fuse.js benchmark...');
  const fuse = new Fuse(miniSearchDocs, {
    keys: ['title', 'content'],
  });

  const fuseLatencies: number[] = [];
  for (let i = 0; i < config.BENCHMARK_RUNS; i++) {
    const query = queries[Math.floor(Math.random() * queries.length)];
    const startTime = process.hrtime.bigint();
    fuse.search(query);
    const endTime = process.hrtime.bigint();
    fuseLatencies.push(Number(endTime - startTime) / 1_000_000);
  }

  fuseLatencies.sort((a, b) => a - b);
  const fuseAvgLatency = fuseLatencies.reduce((sum, val) => sum + val, 0) / fuseLatencies.length;
  const fuseMedianLatency = fuseLatencies[Math.floor(fuseLatencies.length / 2)];
  const fuseP99Latency = fuseLatencies[Math.floor(fuseLatencies.length * 0.99)];
  const fuseMemoryUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;

  allResults.push({
    library: 'fuse.js',
    datasetSize,
    avgLatency: fuseAvgLatency,
    medianLatency: fuseMedianLatency,
    p99Latency: fuseP99Latency,
    memoryUsageMB: fuseMemoryUsageMB,
    timestamp: new Date().toISOString(),
  });
  info('benchmark', 'Fuse.js results:', allResults[3]);

  // Write metrics to file
  const metricsFilePath = config.METRICS_FILE;
  await fs.ensureDir(path.dirname(metricsFilePath));
  await fs.writeJson(metricsFilePath, allResults, { spaces: 2 });
  info('benchmark', `Metrics written to: ${metricsFilePath}`);

  // Optionally write CSV
  if (config.METRICS_FILE.endsWith('.csv')) {
    const parser = new AsyncParser();
    const csv = await parser.parse(allResults);
    await fs.writeFile(metricsFilePath, csv);
    info('benchmark', `CSV metrics written to: ${metricsFilePath}`);
  }
}

runBenchmark().catch((err) => {
  error('benchmark', 'Benchmark failed:', err);
});
