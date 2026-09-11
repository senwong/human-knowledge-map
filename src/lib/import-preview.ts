import type { CanonicalKnowledgeEdge, CanonicalKnowledgeNode } from '../data/math-foundation';
import { decideCanonicalMerge } from './canonical-merge';

export interface ImportPreviewItem {
  incoming: CanonicalKnowledgeNode;
  decision: ReturnType<typeof decideCanonicalMerge>;
}

export interface ImportPreview {
  nodes: ImportPreviewItem[];
  acceptedEdges: CanonicalKnowledgeEdge[];
  rejectedEdges: CanonicalKnowledgeEdge[];
  summary: { insert: number; merge: number; review: number; acceptedEdges: number; rejectedEdges: number };
}

export function previewImport(incomingNodes: CanonicalKnowledgeNode[], incomingEdges: CanonicalKnowledgeEdge[], existingNodes: CanonicalKnowledgeNode[]): ImportPreview {
  const nodes = incomingNodes.map((incoming) => ({ incoming, decision: decideCanonicalMerge(incoming, existingNodes) }));
  const incomingIds = new Set(incomingNodes.map((node) => node.id));
  const existingIds = new Set(existingNodes.map((node) => node.id));
  const known = (id: string) => incomingIds.has(id) || existingIds.has(id);
  const acceptedEdges = incomingEdges.filter((edge) => known(edge.source) && known(edge.target) && edge.source !== edge.target);
  const rejectedEdges = incomingEdges.filter((edge) => !known(edge.source) || !known(edge.target) || edge.source === edge.target);
  const count = (action: 'insert'|'merge'|'review') => nodes.filter((item) => item.decision.action === action).length;
  return {
    nodes,
    acceptedEdges,
    rejectedEdges,
    summary: { insert: count('insert'), merge: count('merge'), review: count('review'), acceptedEdges: acceptedEdges.length, rejectedEdges: rejectedEdges.length }
  };
}
