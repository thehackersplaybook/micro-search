#!/usr/bin/env node

/**
 * Generate test documents of varying sizes for comprehensive benchmarking
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDataDir = path.join(__dirname, '../benchmarks/data/generated');

// Sample content types for realistic documents
const contentTypes = {
  tutorial: {
    topics: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Docker', 'Kubernetes', 'AWS', 'Git', 'MongoDB'],
    sections: ['Introduction', 'Getting Started', 'Installation', 'Configuration', 'Advanced Usage', 'Best Practices', 'Troubleshooting', 'Examples', 'API Reference', 'Conclusion']
  },
  documentation: {
    topics: ['API', 'Database', 'Authentication', 'Deployment', 'Testing', 'Monitoring', 'Security', 'Performance', 'Scaling', 'Architecture'],
    sections: ['Overview', 'Requirements', 'Setup', 'Usage', 'Configuration', 'Examples', 'Troubleshooting', 'FAQ', 'Reference', 'Migration']
  },
  blog: {
    topics: ['Web Development', 'DevOps', 'Machine Learning', 'Data Science', 'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'AI', 'Blockchain', 'IoT'],
    sections: ['Introduction', 'Background', 'Problem Statement', 'Solution', 'Implementation', 'Results', 'Discussion', 'Conclusion', 'References', 'Next Steps']
  }
};

// Common tech words for realistic content
const techWords = [
  'application', 'development', 'framework', 'library', 'component', 'service', 'database', 'server', 'client',
  'authentication', 'authorization', 'configuration', 'deployment', 'testing', 'monitoring', 'performance',
  'scalability', 'security', 'optimization', 'integration', 'implementation', 'architecture', 'design',
  'algorithm', 'data', 'processing', 'analysis', 'visualization', 'machine', 'learning', 'artificial',
  'intelligence', 'cloud', 'container', 'microservice', 'pipeline', 'automation', 'infrastructure',
  'network', 'protocol', 'endpoint', 'middleware', 'cache', 'queue', 'stream', 'batch', 'real-time'
];

function generateRandomWords(count) {
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(techWords[Math.floor(Math.random() * techWords.length)]);
  }
  return words.join(' ');
}

function generateParagraph(sentenceCount = 5) {
  const sentences = [];
  for (let i = 0; i < sentenceCount; i++) {
    const wordCount = Math.floor(Math.random() * 15) + 10; // 10-25 words per sentence
    const sentence = generateRandomWords(wordCount);
    sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
  }
  return sentences.join(' ');
}

function generateSection(title, paragraphCount) {
  const sections = [`## ${title}\n`];
  for (let i = 0; i < paragraphCount; i++) {
    sections.push(generateParagraph());
    sections.push(''); // Empty line between paragraphs
  }
  return sections.join('\n');
}

function generateDocument(type, size, index) {
  const typeConfig = contentTypes[type];
  const topic = typeConfig.topics[Math.floor(Math.random() * typeConfig.topics.length)];
  const title = `${topic} ${typeConfig.sections[0]} Guide ${index + 1}`;
  
  // Calculate content based on target size
  let targetWords;
  switch (size) {
    case 'small': targetWords = Math.floor(Math.random() * 200) + 100; break; // 100-300 words
    case 'medium': targetWords = Math.floor(Math.random() * 800) + 500; break; // 500-1300 words
    case 'large': targetWords = Math.floor(Math.random() * 2000) + 1500; break; // 1500-3500 words
    case 'xlarge': targetWords = Math.floor(Math.random() * 5000) + 3000; break; // 3000-8000 words
  }
  
  const frontmatter = `---
title: ${title}
category: ${type}
size: ${size}
words: ${targetWords}
tags: [${topic.toLowerCase()}, ${type}, tutorial]
created: ${new Date().toISOString()}
---

`;

  let content = `# ${title}\n\n`;
  let currentWords = title.split(' ').length;
  
  // Add sections until we reach target word count
  while (currentWords < targetWords) {
    const sectionTitle = typeConfig.sections[Math.floor(Math.random() * typeConfig.sections.length)];
    const remainingWords = targetWords - currentWords;
    const paragraphCount = Math.max(1, Math.floor(remainingWords / 50)); // ~50 words per paragraph
    
    const section = generateSection(sectionTitle, Math.min(paragraphCount, 5));
    content += section + '\n\n';
    
    // Estimate words added (rough calculation)
    currentWords += section.split(' ').length;
    
    if (paragraphCount <= 1) break; // Prevent infinite loop
  }
  
  return frontmatter + content;
}

async function generateTestDocuments() {
  console.log('🚀 Generating comprehensive test documents...');
  
  // Clear existing generated docs
  await fs.remove(testDataDir);
  await fs.ensureDir(testDataDir);
  
  const documentSets = [
    { size: 'small', count: 30, type: 'tutorial' },
    { size: 'small', count: 20, type: 'documentation' },
    { size: 'medium', count: 25, type: 'tutorial' },
    { size: 'medium', count: 15, type: 'blog' },
    { size: 'large', count: 15, type: 'documentation' },
    { size: 'large', count: 10, type: 'blog' },
    { size: 'xlarge', count: 8, type: 'tutorial' },
    { size: 'xlarge', count: 7, type: 'documentation' }
  ];
  
  let totalDocs = 0;
  
  for (const set of documentSets) {
    console.log(`📝 Generating ${set.count} ${set.size} ${set.type} documents...`);
    
    for (let i = 0; i < set.count; i++) {
      const doc = generateDocument(set.type, set.size, i);
      const filename = `${set.type}-${set.size}-${String(i + 1).padStart(3, '0')}.md`;
      const filepath = path.join(testDataDir, filename);
      
      await fs.writeFile(filepath, doc);
      totalDocs++;
    }
  }
  
  console.log(`✅ Generated ${totalDocs} test documents in ${testDataDir}`);
  
  // Create a summary file
  const summary = {
    totalDocuments: totalDocs,
    generatedAt: new Date().toISOString(),
    distribution: documentSets.map(set => ({
      size: set.size,
      type: set.type,
      count: set.count
    })),
    estimatedTotalWords: documentSets.reduce((total, set) => {
      const avgWords = {
        small: 200,
        medium: 900,
        large: 2500,
        xlarge: 5500
      };
      return total + (set.count * avgWords[set.size]);
    }, 0)
  };
  
  await fs.writeJson(path.join(testDataDir, 'summary.json'), summary, { spaces: 2 });
  
  return summary;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateTestDocuments().catch(console.error);
}

export { generateTestDocuments };