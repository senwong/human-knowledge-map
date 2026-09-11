import type { CanonicalKnowledgeNode } from '../data/math-foundation';

export interface PositionedKnowledgeNode extends CanonicalKnowledgeNode { x: number; y: number; }
export interface KnowledgeCluster {
  id: string;
  label: string;
  domain: string;
  x: number;
  y: number;
  size: number;
  nodeIds: string[];
  minDifficulty: number;
  maxDifficulty: number;
}

export function clusterForZoom(nodes: PositionedKnowledgeNode[], zoom: number): KnowledgeCluster[] {
  const cell = zoom < 0.25 ? 2400 : zoom < 0.5 ? 1400 : zoom < 0.8 ? 800 : 420;
  const groups = new Map<string, PositionedKnowledgeNode[]>();
  for (const node of nodes) {
    const key = `${node.domain}:${Math.floor(node.x / cell)}:${Math.floor(node.y / cell)}`;
    const group = groups.get(key) ?? [];
    group.push(node);
    groups.set(key, group);
  }
  return [...groups.entries()].map(([id, group]) => ({
    id: `cluster:${id}`,
    label: group.length === 1 ? group[0].label : `${group[0].domain} · ${group.length}`,
    domain: group[0].domain,
    x: group.reduce((sum, node) => sum + node.x, 0) / group.length,
    y: group.reduce((sum, node) => sum + node.y, 0) / group.length,
    size: group.length,
    nodeIds: group.map((node) => node.id),
    minDifficulty: Math.min(...group.map((node) => node.difficulty)),
    maxDifficulty: Math.max(...group.map((node) => node.difficulty))
  }));
}

export function shouldRenderClusters(zoom: number, visibleNodeCount: number) {
  return zoom < 0.85 || visibleNodeCount > 1200;
}
