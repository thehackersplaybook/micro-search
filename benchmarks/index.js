"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = require("@core/search");
const index_1 = __importDefault(require("@config/index"));
const index_2 = require("@logger/index");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const minisearch_1 = __importDefault(require("minisearch"));
const flexsearch_1 = __importDefault(require("flexsearch"));
const fuse_js_1 = __importDefault(require("fuse.js"));
const json2csv_1 = require("json2csv");
function runBenchmark() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, index_2.info)('benchmark', 'Starting benchmark run...');
        const allResults = [];
        // Load documents for all benchmarks
        const docsPath = path_1.default.resolve(__dirname, index_1.default.ROOT_DOCS_FOLDER);
        (0, index_2.info)('benchmark', `Loading documents from: ${docsPath}`);
        const documents = yield fs_extra_1.default.readdir(docsPath);
        const datasetSize = documents.length;
        (0, index_2.info)('benchmark', `Loaded ${datasetSize} documents.`);
        // --- micro-search benchmark ---
        (0, index_2.info)('benchmark', 'Running micro-search benchmark...');
        (0, search_1.clearIndex)(); // Clear index before adding documents
        yield (0, search_1.addDocumentsFromPath)(docsPath);
        const microSearchLatencies = [];
        const queries = ['test', 'document', 'repeated', 'another', 'word']; // Example queries
        for (let i = 0; i < index_1.default.BENCHMARK_RUNS; i++) {
            const query = queries[Math.floor(Math.random() * queries.length)];
            const startTime = process.hrtime.bigint();
            yield (0, search_1.search)(query);
            const endTime = process.hrtime.bigint();
            microSearchLatencies.push(Number(endTime - startTime) / 1000000); // Convert nanoseconds to milliseconds
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
        (0, index_2.info)('benchmark', 'micro-search results:', allResults[0]);
        // --- MiniSearch benchmark ---
        (0, index_2.info)('benchmark', 'Running MiniSearch benchmark...');
        const miniSearch = new minisearch_1.default({
            fields: ['title', 'content'],
            storeFields: ['title', 'path'],
        });
        const miniSearchDocs = [];
        for (const docName of documents) {
            const filePath = path_1.default.join(docsPath, docName);
            const fileContent = yield fs_extra_1.default.readFile(filePath, 'utf-8');
            // Simplified parsing for benchmark, assuming content is plain text for now
            miniSearchDocs.push({
                id: filePath,
                title: docName.replace('.md', ''),
                content: fileContent,
            });
        }
        miniSearch.addAll(miniSearchDocs);
        const miniSearchLatencies = [];
        for (let i = 0; i < index_1.default.BENCHMARK_RUNS; i++) {
            const query = queries[Math.floor(Math.random() * queries.length)];
            const startTime = process.hrtime.bigint();
            miniSearch.search(query);
            const endTime = process.hrtime.bigint();
            miniSearchLatencies.push(Number(endTime - startTime) / 1000000);
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
        (0, index_2.info)('benchmark', 'MiniSearch results:', allResults[1]);
        // --- FlexSearch benchmark ---
        (0, index_2.info)('benchmark', 'Running FlexSearch benchmark...');
        const flexSearch = new flexsearch_1.default.Document({
            document: {
                id: 'id',
                index: ['title', 'content'],
            },
        });
        for (const doc of miniSearchDocs) {
            flexSearch.add(doc);
        }
        const flexSearchLatencies = [];
        for (let i = 0; i < index_1.default.BENCHMARK_RUNS; i++) {
            const query = queries[Math.floor(Math.random() * queries.length)];
            const startTime = process.hrtime.bigint();
            flexSearch.search(query);
            const endTime = process.hrtime.bigint();
            flexSearchLatencies.push(Number(endTime - startTime) / 1000000);
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
        (0, index_2.info)('benchmark', 'FlexSearch results:', allResults[2]);
        // --- Fuse.js benchmark ---
        (0, index_2.info)('benchmark', 'Running Fuse.js benchmark...');
        const fuse = new fuse_js_1.default(miniSearchDocs, {
            keys: ['title', 'content'],
        });
        const fuseLatencies = [];
        for (let i = 0; i < index_1.default.BENCHMARK_RUNS; i++) {
            const query = queries[Math.floor(Math.random() * queries.length)];
            const startTime = process.hrtime.bigint();
            fuse.search(query);
            const endTime = process.hrtime.bigint();
            fuseLatencies.push(Number(endTime - startTime) / 1000000);
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
        (0, index_2.info)('benchmark', 'Fuse.js results:', allResults[3]);
        // Write metrics to file
        const metricsFilePath = path_1.default.resolve(__dirname, '../', index_1.default.METRICS_FILE);
        yield fs_extra_1.default.ensureDir(path_1.default.dirname(metricsFilePath));
        yield fs_extra_1.default.writeJson(metricsFilePath, allResults, { spaces: 2 });
        (0, index_2.info)('benchmark', `Metrics written to: ${metricsFilePath}`);
        // Optionally write CSV
        if (index_1.default.METRICS_FILE.endsWith('.csv')) {
            const csv = yield new json2csv_1.AsyncParser().parse(allResults).promise();
            yield fs_extra_1.default.writeFile(metricsFilePath, csv);
            (0, index_2.info)('benchmark', `CSV metrics written to: ${metricsFilePath}`);
        }
    });
}
runBenchmark().catch(err => {
    (0, index_2.error)('benchmark', 'Benchmark failed:', err);
});
