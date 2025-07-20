import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration schema
const configSchema = z.object({
  ROOT_DOCS_FOLDER: z.string().default('./benchmarks/data/markdown'),
  MAX_DOCS: z.coerce.number().positive().default(100000),
  SEARCH_MAX_RESULTS: z.coerce.number().positive().default(10),
  METRICS_FILE: z.string().default('./metrics/search-benchmarks.json'),
  BENCHMARK_RUNS: z.coerce.number().positive().default(1000),
  VERBOSE: z.coerce.boolean().default(false),
  ALLOW_FUZZY_SEARCH: z.coerce.boolean().default(false),
  ALLOW_PHRASE_SEARCH: z.coerce.boolean().default(true),
  TIMEOUT_WARN_MS: z.coerce.number().positive().default(100),
  TOKENIZATION_MODE: z.enum(['word', 'ngram', 'whitespace']).default('word'),
  REMOVE_STOPWORDS: z.coerce.boolean().default(true),
  TIMEZONE: z.string().default('UTC'),
  FIELD_WEIGHTS: z
    .string()
    .transform((str: string) => {
      try {
        return JSON.parse(str);
      } catch {
        return { title: 2, content: 1 };
      }
    })
    .default('{"title":2,"content":1}'),
  INDEX_BATCH_SIZE: z.coerce.number().positive().default(1000),
  SNIPPET_LENGTH: z.coerce.number().positive().default(150),
  SNIPPET_CONTEXT_WORDS: z.coerce.number().positive().default(10),
});

// Parse and validate configuration
const config = configSchema.parse(process.env);

// Resolve paths relative to project root
const projectRoot = path.resolve(__dirname, '../../../');
config.ROOT_DOCS_FOLDER = path.resolve(projectRoot, config.ROOT_DOCS_FOLDER);
config.METRICS_FILE = path.resolve(projectRoot, config.METRICS_FILE);

export default config;

// Export configuration type
export type Config = z.infer<typeof configSchema>;
