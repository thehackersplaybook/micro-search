import { SearchDocument } from '../core/search';
import fs from 'fs-extra';
import path from 'path';
import fastglob from 'fast-glob';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import strip from 'strip-markdown';
import matter from 'gray-matter';

export async function loadDocuments(rootDir: string): Promise<SearchDocument[]> {
  const files = await fastglob('**/*.md', { cwd: rootDir });
  const documents = [];

  for (const file of files) {
    const filePath = path.join(rootDir, file);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const textContent = await unified()
      .use(remarkParse)
      .use(strip)
      .use(remarkStringify)
      .process(content);

    documents.push({
      id: filePath,
      title: data.title || path.basename(file, '.md'),
      content: String(textContent),
    });
  }

  return documents;
}