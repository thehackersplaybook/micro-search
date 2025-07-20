import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  ROOT_DOCS_FOLDER: string;
  MAX_DOCS: number;
  SEARCH_MAX_RESULTS: number;
  METRICS_FILE: string;
  BENCHMARK_RUNS: number;
  VERBOSE: boolean;
  ALLOW_FUZZY_SEARCH: boolean;
  ALLOW_PHRASE_SEARCH: boolean;
  TIMEOUT_WARN_MS: number;
}

const config: Config = {
  ROOT_DOCS_FOLDER: process.env.ROOT_DOCS_FOLDER || './data/markdown',
  MAX_DOCS: parseInt(process.env.MAX_DOCS || '100000', 10),
  SEARCH_MAX_RESULTS: parseInt(process.env.SEARCH_MAX_RESULTS || '10', 10),
  METRICS_FILE: process.env.METRICS_FILE || './metrics/search-benchmarks.json',
  BENCHMARK_RUNS: parseInt(process.env.BENCHMARK_RUNS || '1000', 10),
  VERBOSE: process.env.VERBOSE === 'true',
  ALLOW_FUZZY_SEARCH: process.env.ALLOW_FUZZY_SEARCH === 'true',
  ALLOW_PHRASE_SEARCH: process.env.ALLOW_PHRASE_SEARCH === 'true',
  TIMEOUT_WARN_MS: parseInt(process.env.TIMEOUT_WARN_MS || '100', 10),
};

export default config;
