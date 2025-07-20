import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { addDocumentsFromPath, search, clearIndex } from '../src/core/search.js';
import { tokenize, generateSnippet } from '../src/core/tokenizer.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../src/config/index.js';

// Convert __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('micro-search', () => {
  const testDataDir = path.join(__dirname, '../benchmarks/data/markdown');

  beforeAll(async () => {
    await fs.remove(testDataDir);
    await fs.ensureDir(testDataDir);
  });

  beforeEach(() => {
    clearIndex();
  });

  afterEach(async () => {
    await fs.remove(testDataDir);
    await fs.ensureDir(testDataDir);
  });

  describe('tokenization', () => {
    it('should tokenize text correctly in word mode', () => {
      const text = 'Hello, World! This is a test.';
      const tokens = tokenize(text);
      expect(tokens).toEqual(['hello', 'world', 'test']);
    });

    it('should remove stopwords when configured', () => {
      const text = 'The quick brown fox jumps over the lazy dog';
      const tokens = tokenize(text);
      expect(tokens).not.toContain('the');
      expect(tokens).not.toContain('over');
    });

    it('should generate ngrams when configured', async () => {
      const oldMode = config.TOKENIZATION_MODE;
      config.TOKENIZATION_MODE = 'ngram';

      const text = 'hello';
      const tokens = tokenize(text);
      expect(tokens).toContain('hel');
      expect(tokens).toContain('ell');
      expect(tokens).toContain('llo');

      config.TOKENIZATION_MODE = oldMode;
    });
  });

  describe('snippet generation', () => {
    it('should generate snippets with highlighted query terms', () => {
      const text = 'This is a long document about search engines. They are very fast and efficient.';
      const snippet = generateSnippet(text, ['search', 'fast']);
      expect(snippet).toContain('**search**');
      expect(snippet).toContain('**fast**');
    });

    it('should respect snippet length configuration', () => {
      const text = 'A '.repeat(1000);
      const snippet = generateSnippet(text, ['not-found']);
      expect(snippet.length).toBeLessThanOrEqual(config.SNIPPET_LENGTH + 10); // Allow for ellipsis
    });
  });

  describe('document indexing', () => {
    it('should index and retrieve documents', async () => {
      const doc1 = path.join(testDataDir, 'test1.md');
      const doc2 = path.join(testDataDir, 'test2.md');

      await fs.writeFile(doc1, '---\ntitle: Test Document 1\n---\n\nThis is a test document.');
      await fs.writeFile(
        doc2,
        '---\ntitle: Test Document 2\n---\n\nThis is another test document, with the word test repeated.',
      );

      await addDocumentsFromPath(testDataDir);

      const results = await search('test');
      expect(results).toHaveLength(2);
      expect(results[0].score).toBeGreaterThan(results[1].score); // Doc2 should score higher
    });

    it('should respect MAX_DOCS limit', async () => {
      const testLimit = 50; // Use a smaller number for faster testing
      const oldMaxDocs = config.MAX_DOCS;
      config.MAX_DOCS = testLimit;

      const docs = Array.from({ length: testLimit + 10 }, (_, i) => ({
        path: path.join(testDataDir, `doc${i}.md`),
        content: `---\ntitle: Document ${i}\n---\n\nTest content ${i}`,
      }));

      await Promise.all(docs.map((doc) => fs.writeFile(doc.path, doc.content)));
      await addDocumentsFromPath(testDataDir);

      const results = await search('test', { limit: testLimit });
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(testLimit);

      // Restore original value
      config.MAX_DOCS = oldMaxDocs;
    }, 10000);
  });

  describe('search functionality', () => {
    beforeEach(async () => {
      const docs = [
        { title: 'JavaScript Basics', content: 'Learn JavaScript programming basics.' },
        { title: 'Advanced TypeScript', content: 'Deep dive into TypeScript features.' },
        { title: 'Node.js Guide', content: 'Comprehensive guide to Node.js development.' },
      ];

      await Promise.all(
        docs.map((doc, i) =>
          fs.writeFile(path.join(testDataDir, `doc${i}.md`), `---\ntitle: ${doc.title}\n---\n\n${doc.content}`),
        ),
      );

      await addDocumentsFromPath(testDataDir);
    });

    it('should find documents by title', async () => {
      const results = await search('typescript');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Advanced TypeScript');
    });

    it('should find documents by content', async () => {
      const results = await search('programming');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('JavaScript Basics');
    });

    it('should respect search result limit', async () => {
      const results = await search('guide', { limit: 1 });
      expect(results).toHaveLength(1);
    });

    it('should handle phrase search correctly', async () => {
      const oldValue = config.ALLOW_PHRASE_SEARCH;
      config.ALLOW_PHRASE_SEARCH = true;

      const results = await search('javascript programming');
      expect(results).toHaveLength(1); // Should only match doc with both terms

      config.ALLOW_PHRASE_SEARCH = oldValue;
    });

    it('should return empty results for non-existent terms', async () => {
      const results = await search('nonexistentterm');
      expect(results).toHaveLength(0);
    });

    it('should handle special characters in search', async () => {
      const results = await search('Node.js');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Node.js Guide');
    });
  });
});
