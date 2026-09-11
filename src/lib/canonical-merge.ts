import type { CanonicalKnowledgeNode } from '../data/math-foundation';
import { findDuplicateCandidates } from './dedupe';

export interface MergeDecision {
  incomingId: string;
  action: 'insert' | 'merge' | 'review';
  targetId?: string;
  score?: number;
  reasons: string[];
}

export function decideCanonicalMerge(incoming: CanonicalKnowledgeNode, existing: CanonicalKnowledgeNode[]): MergeDecision {
  const candidates = findDuplicateCandidates(incoming as any, existing.map((node) => ({ id: node.id, data: node as any })), 0.65);
  const best = candidates[0];
  if (!best) return { incomingId: incoming.id, action: 'insert', reasons: ['no duplicate candidate above threshold'] };
  if (best.score >= 0.95) return { incomingId: incoming.id, action: 'merge', targetId: best.id, score: best.score, reasons: ['near-identical canonical label or alias'] };
  return { incomingId: incoming.id, action: 'review', targetId: best.id, score: best.score, reasons: ['possible semantic duplicate requires human review'] };
}

export function mergeCanonicalNode(base: CanonicalKnowledgeNode, incoming: CanonicalKnowledgeNode): CanonicalKnowledgeNode {
  return {
    ...base,
    ...incoming,
    id: base.id,
    aliases: [...new Set([...(base.aliases ?? []), ...(incoming.aliases ?? []), incoming.label].filter((value) => value !== base.label))]
  };
}
