import type { CanonicalKnowledgeEdge, CanonicalKnowledgeNode } from '../data/math-foundation';

export interface SeedBatch {
  id: string;
  nodes: CanonicalKnowledgeNode[];
  edges: CanonicalKnowledgeEdge[];
  createdAt: string;
}

export function buildSeedBatch(id: string, nodes: CanonicalKnowledgeNode[], edges: CanonicalKnowledgeEdge[]): SeedBatch {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const safeEdges = edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  return { id, nodes, edges: safeEdges, createdAt: new Date().toISOString() };
}

export function seedSummary(batch: SeedBatch) {
  return { id: batch.id, nodes: batch.nodes.length, edges: batch.edges.length, createdAt: batch.createdAt };
}
