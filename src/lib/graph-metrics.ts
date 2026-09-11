import type { Edge, Node } from '@xyflow/react';
import type { KnowledgeNodeData } from '../types/knowledge';

export interface GraphMetrics {
  nodes: number;
  edges: number;
  domains: number;
  averageDegree: number;
  isolatedNodes: number;
  researchNodes: number;
  educationCoverage: Record<string, number>;
  domainCoverage: Record<string, number>;
}

export function calculateGraphMetrics(nodes: Node<KnowledgeNodeData>[], edges: Edge[]): GraphMetrics {
  const degree = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }
  const educationCoverage: Record<string, number> = {};
  const domainCoverage: Record<string, number> = {};
  for (const node of nodes) {
    educationCoverage[node.data.educationLevel] = (educationCoverage[node.data.educationLevel] ?? 0) + 1;
    domainCoverage[node.data.domain] = (domainCoverage[node.data.domain] ?? 0) + 1;
  }
  return {
    nodes: nodes.length,
    edges: edges.length,
    domains: Object.keys(domainCoverage).length,
    averageDegree: nodes.length ? (edges.length * 2) / nodes.length : 0,
    isolatedNodes: [...degree.values()].filter((value) => value === 0).length,
    researchNodes: nodes.filter((node) => node.data.type === 'research_topic').length,
    educationCoverage,
    domainCoverage
  };
}
