import type { Node } from '@xyflow/react';
import type { KnowledgeNodeData } from '../types/knowledge';

export interface GrowthTarget {
  domain: string;
  current: number;
  target: number;
  gap: number;
  priority: number;
}

export function planGraphGrowth(nodes: Node<KnowledgeNodeData>[], targetPerDomain = 1000): GrowthTarget[] {
  const counts = new Map<string, number>();
  for (const node of nodes) counts.set(node.data.domain, (counts.get(node.data.domain) ?? 0) + 1);
  return [...counts.entries()]
    .map(([domain, current]) => {
      const gap = Math.max(0, targetPerDomain - current);
      return { domain, current, target: targetPerDomain, gap, priority: gap / targetPerDomain };
    })
    .sort((a, b) => b.priority - a.priority);
}

export function chooseExpansionSeeds(nodes: Node<KnowledgeNodeData>[], domain: string, limit = 10) {
  return nodes
    .filter((node) => node.data.domain === domain)
    .sort((a, b) => a.data.zoomLevel - b.data.zoomLevel || a.data.difficulty - b.data.difficulty)
    .slice(0, limit);
}
