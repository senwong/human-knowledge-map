import type { KnowledgeNodeData } from '../types/knowledge';

export interface KnowledgeQualityInput {
  node: KnowledgeNodeData;
  sourceCount?: number;
  incomingEdges?: number;
  outgoingEdges?: number;
  duplicateRisk?: number;
}

export interface KnowledgeQualityScore {
  total: number;
  completeness: number;
  connectivity: number;
  provenance: number;
  uniqueness: number;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function scoreKnowledgeQuality(input: KnowledgeQualityInput): KnowledgeQualityScore {
  const required = [input.node.label, input.node.description, input.node.domain, input.node.educationLevel, input.node.type];
  const completeness = required.filter(Boolean).length / required.length;
  const degree = (input.incomingEdges ?? 0) + (input.outgoingEdges ?? 0);
  const connectivity = clamp(degree / 4);
  const provenance = clamp((input.sourceCount ?? 0) / 2);
  const uniqueness = 1 - clamp(input.duplicateRisk ?? 0);
  const total = completeness * 0.3 + connectivity * 0.25 + provenance * 0.3 + uniqueness * 0.15;
  return { total, completeness, connectivity, provenance, uniqueness };
}

export function qualityLabel(score: number) {
  if (score >= 0.85) return 'verified';
  if (score >= 0.65) return 'good';
  if (score >= 0.4) return 'needs-review';
  return 'draft';
}
