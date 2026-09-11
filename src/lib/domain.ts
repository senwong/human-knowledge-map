import type { Edge, Node } from '@xyflow/react';
import type { KnowledgeNodeData } from '../types/knowledge';

export interface DomainSummary {
  domain: string;
  nodeCount: number;
  masteredCount: number;
  averageDifficulty: number;
}

export function summarizeDomains(nodes: Node<KnowledgeNodeData>[]): DomainSummary[] {
  const groups = new Map<string, Node<KnowledgeNodeData>[]>();
  for (const node of nodes) {
    const list = groups.get(node.data.domain) ?? [];
    list.push(node);
    groups.set(node.data.domain, list);
  }
  return [...groups.entries()].map(([domain, list]) => ({
    domain,
    nodeCount: list.length,
    masteredCount: list.filter((n) => n.data.learningStatus === 'mastered').length,
    averageDifficulty: Math.round((list.reduce((sum, n) => sum + n.data.difficulty, 0) / list.length) * 10) / 10
  })).sort((a, b) => b.nodeCount - a.nodeCount);
}

export function graphStats(nodes: Node<KnowledgeNodeData>[], edges: Edge[]) {
  return {
    nodes: nodes.length,
    edges: edges.length,
    domains: new Set(nodes.map((n) => n.data.domain)).size,
    researchNodes: nodes.filter((n) => n.data.educationLevel === 'research').length
  };
}
