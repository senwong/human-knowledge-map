import type { CanonicalKnowledgeNode } from '../data/math-foundation';

export interface MapPosition { x: number; y: number; }
export interface MapBounds { minX: number; minY: number; maxX: number; maxY: number; }
export interface MapKnowledgeNode extends CanonicalKnowledgeNode {
  x: number;
  y: number;
  isCluster?: boolean;
  memberCount?: number;
  clusterZoom?: number;
}

function hash(input: string) {
  let value = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/** Deterministic fallback used only until a node has persisted map coordinates. */
export function deterministicMapPosition(node: Pick<CanonicalKnowledgeNode, 'id'|'domain'|'difficulty'>): MapPosition {
  const domainHash = hash(node.domain);
  const nodeHash = hash(node.id);
  const domainAngle = ((domainHash % 360) * Math.PI) / 180;
  const domainRadius = 850 + (domainHash % 11) * 170;
  const localAngle = ((nodeHash % 360) * Math.PI) / 180;
  const localRadius = 90 + (nodeHash % 31) * 24 + Math.min(12, node.difficulty) * 22;
  return {
    x: Math.cos(domainAngle) * domainRadius + Math.cos(localAngle) * localRadius,
    y: Math.sin(domainAngle) * domainRadius + Math.sin(localAngle) * localRadius
  };
}

export function withMapPosition(node: CanonicalKnowledgeNode & Partial<MapPosition>): MapKnowledgeNode {
  const fallback = deterministicMapPosition(node);
  return { ...node, x: Number.isFinite(node.x) ? Number(node.x) : fallback.x, y: Number.isFinite(node.y) ? Number(node.y) : fallback.y };
}

export function clusterForZoom(nodes: MapKnowledgeNode[], zoom: number): MapKnowledgeNode[] {
  if (zoom >= 0.72 || nodes.length < 80) return nodes;
  const cellSize = zoom < 0.22 ? 1100 : zoom < 0.42 ? 650 : 360;
  const buckets = new Map<string, MapKnowledgeNode[]>();
  for (const node of nodes) {
    const key = `${Math.floor(node.x / cellSize)}:${Math.floor(node.y / cellSize)}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(node);
    buckets.set(key, bucket);
  }

  const result: MapKnowledgeNode[] = [];
  for (const [key, members] of buckets) {
    if (members.length === 1) { result.push(members[0]); continue; }
    const x = members.reduce((sum, node) => sum + node.x, 0) / members.length;
    const y = members.reduce((sum, node) => sum + node.y, 0) / members.length;
    const domains = new Set(members.map((node) => node.domain));
    result.push({
      id: `cluster:${cellSize}:${key}`,
      label: domains.size === 1 ? `${members[0].domain} · ${members.length}` : `${members.length} 个知识点`,
      domain: domains.size === 1 ? members[0].domain : '跨领域',
      educationLevel: 'mixed',
      type: 'concept',
      difficulty: Math.max(1, Math.round(members.reduce((sum, node) => sum + Math.min(10, node.difficulty), 0) / members.length)),
      aliases: [],
      x,
      y,
      isCluster: true,
      memberCount: members.length,
      clusterZoom: zoom
    });
  }
  return result;
}
