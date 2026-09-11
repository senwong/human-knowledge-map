import { mathFoundationNodes, mathFoundationEdges, type CanonicalKnowledgeNode, type CanonicalKnowledgeEdge } from './math-foundation';
import type { KnowledgeSource } from '../lib/source-policy';
import type { NodeProvenanceRecord } from '../lib/provenance-coverage';

export const canonicalMathNodes: CanonicalKnowledgeNode[] = mathFoundationNodes;
export const canonicalMathEdges: CanonicalKnowledgeEdge[] = mathFoundationEdges;

const curriculumSource: KnowledgeSource = {
  id: 'curriculum-math-seed',
  title: 'Mathematics curriculum seed mapping',
  kind: 'curriculum',
  publisher: 'Human Knowledge Map editorial seed'
};

const textbookSource: KnowledgeSource = {
  id: 'textbook-math-seed',
  title: 'Mathematics textbook concept cross-check',
  kind: 'textbook',
  publisher: 'Human Knowledge Map editorial seed'
};

const seedVerified = new Set([
  'counting','natural-numbers','addition','subtraction','multiplication','division','fractions','decimals','ratio','percentage',
  'variables','linear-equations','functions','triangles','pythagorean','trigonometry','vectors','limits','derivatives','integrals',
  'matrices','linear-algebra','probability','random-variables','bayes-theorem'
]);

export const canonicalMathProvenance: NodeProvenanceRecord[] = canonicalMathNodes.map((node) => ({
  nodeId: node.id,
  sources: seedVerified.has(node.id) ? [curriculumSource, textbookSource] : [curriculumSource],
  reviewStatus: seedVerified.has(node.id) ? 'reviewed' : 'unreviewed'
}));

export const canonicalMathDataset = {
  id: 'math-canonical-seed-v1',
  version: '1.0.0',
  status: 'editorial-seed' as const,
  nodes: canonicalMathNodes,
  edges: canonicalMathEdges,
  provenance: canonicalMathProvenance,
  note: 'Seed dataset with explicit provenance status. Reviewed means editorial cross-checking, not external certification.'
};
