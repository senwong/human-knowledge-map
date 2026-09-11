import type { Node } from '@xyflow/react';
import type { KnowledgeNodeData } from '../types/knowledge';

export type SemanticZoomBand = 'overview' | 'domain' | 'concept' | 'detail';

export function getSemanticZoomBand(viewportZoom: number): SemanticZoomBand {
  if (viewportZoom < 0.35) return 'overview';
  if (viewportZoom < 0.65) return 'domain';
  if (viewportZoom < 1.15) return 'concept';
  return 'detail';
}

export function visibleForSemanticZoom(node: Node<KnowledgeNodeData>, band: SemanticZoomBand) {
  const level = node.data.zoomLevel;
  if (band === 'overview') return level <= 4 || ['linear-algebra', 'neural-networks', 'transformer'].includes(node.id);
  if (band === 'domain') return level <= 9 || ['linear-algebra', 'neural-networks', 'attention', 'transformer'].includes(node.id);
  if (band === 'concept') return level <= 17;
  return true;
}

export const semanticZoomLabel: Record<SemanticZoomBand, string> = {
  overview: '知识大陆',
  domain: '领域',
  concept: '知识点',
  detail: '研究细节'
};
