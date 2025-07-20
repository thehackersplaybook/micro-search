import fs from 'fs-extra';
import path from 'path';
import glob from 'fast-glob';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import stripMarkdown from 'strip-markdown';
import { SearchDocument } from '../core/search.js';
import { info } from '../logger/index.js';

/**
 * Converts Markdown to plain text
 * @param markdown Markdown content
 * @returns Plain text
 */
async function markdownToText(markdown: string): Promise<string> {
  const result = await unified().use(remarkParse).use(stripMarkdown).use(remarkStringify).process(markdown);

  return String(result);
}

/**
 * Loads documents from a directory
 * @param rootPath Root directory path
 * @returns Array of SearchDocument objects
 */
export async function loadDocuments(rootPath: string): Promise<SearchDocument[]> {
  const documents: SearchDocument[] = [];
  const absolutePath = path.resolve(rootPath);

  info('file', `Loading documents from ${absolutePath}`);

  // Find all markdown files
  const files = await glob('**/*.md', {
    cwd: absolutePath,
    absolute: true,
  });

  info('file', `Found ${files.length} markdown files`);

  for (const file of files) {
    const relativePath = path.relative(absolutePath, file);
    const content = await fs.readFile(file, 'utf-8');

    // Parse frontmatter
    const { data, content: markdownContent } = matter(content);
    const plainText = await markdownToText(markdownContent);

    documents.push({
      id: relativePath,
      title: data.title || path.basename(file, '.md'),
      content: plainText,
      path: relativePath,
      ...data, // Include all frontmatter data
    });
  }

  return documents;
}
