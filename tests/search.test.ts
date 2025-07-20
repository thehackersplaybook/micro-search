import { describe, it, expect, beforeAll } from 'vitest';
import { addDocumentsFromPath, search, clearIndex } from '../src/core/search';
import fs from 'fs-extra';
import path from 'path';

describe('search', () => {
  beforeAll(async () => {
    clearIndex();
    const dataDir = path.join(__dirname, '../benchmarks/data/markdown');
    await fs.remove(dataDir);
    await fs.ensureDir(dataDir);
    await fs.writeFile(path.join(dataDir, 'test1.md'), '---\ntitle: Test Document 1\n---\n\nThis is a test document.');
    await fs.writeFile(path.join(dataDir, 'test2.md'), '---\ntitle: Test Document 2\n---\n\nThis is another test document, with the word test repeated.');
    await addDocumentsFromPath('benchmarks/data/markdown');
  });

  it('should return a result for a simple query', async () => {
    const results = await search('test');

    expect(results.length).toBe(2);
    expect(results[0].title).toBe('Test Document 2');
  });
});