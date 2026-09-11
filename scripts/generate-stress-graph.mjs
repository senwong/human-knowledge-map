import { writeFile } from 'node:fs/promises';

const count = Math.max(1000, Number(process.argv[2] ?? 100000));
const domains = ['数学','物理','计算机科学','人工智能','生物学','化学'];
const nodes = Array.from({ length: count }, (_, index) => ({
  id: `stress-${index}`,
  label: `Stress Node ${index}`,
  domain: domains[index % domains.length],
  educationLevel: index % 12 < 4 ? 'primary' : index % 12 < 8 ? 'secondary' : 'advanced',
  type: 'concept',
  difficulty: (index % 10) + 1,
  x: (index % 500) * 90,
  y: Math.floor(index / 500) * 90
}));
const edges = Array.from({ length: Math.max(0, count - 1) }, (_, index) => ({ source: `stress-${index}`, target: `stress-${index + 1}`, relation: 'prerequisite' }));
const document = { version: 1, generatedAt: new Date().toISOString(), synthetic: true, nodes, edges };
const output = process.argv[3] ?? './stress-graph.json';
await writeFile(output, JSON.stringify(document));
console.log(`generated ${nodes.length} nodes and ${edges.length} edges -> ${output}`);
