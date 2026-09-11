import type { Edge, Node } from '@xyflow/react';
import type { KnowledgeNodeData } from '../types/knowledge';

export interface DomainBridge {
  sourceId: string;
  targetId: string;
  sourceDomain: string;
  targetDomain: string;
  score: number;
  reason: string;
}

export function discoverDomainBridges(nodes: Node<KnowledgeNodeData>[], edges: Edge[]): DomainBridge[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const bridges: DomainBridge[] = [];
  for (const edge of edges) {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (!source || !target || source.data.domain === target.data.domain) continue;
    const distance = Math.abs(source.data.zoomLevel - target.data.zoomLevel);
    const score = Math.max(0.2, 1 - distance / 20);
    bridges.push({
      sourceId: source.id,
      targetId: target.id,
      sourceDomain: source.data.domain,
      targetDomain: target.data.domain,
      score,
      reason: `${edge.label ?? 'related'} connects ${source.data.label} to ${target.data.label}`
    });
  }
  return bridges.sort((a, b) => b.score - a.score);
}
