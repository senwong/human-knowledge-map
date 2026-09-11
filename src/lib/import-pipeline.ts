import type { Edge, Node } from '@xyflow/react';
import type { KnowledgeNodeData } from '../types/knowledge';
import { findDuplicateCandidates } from './dedupe';
import { scoreKnowledgeQuality } from './quality';

export interface ImportCandidate {
  node: Node<KnowledgeNodeData>;
  duplicateOf?: string;
  quality: ReturnType<typeof scoreKnowledgeQuality>;
  status: 'accept' | 'review' | 'reject';
}

export function stageImport(nodes: Node<KnowledgeNodeData>[], edges: Edge[], existing: Node<KnowledgeNodeData>[]): ImportCandidate[] {
  return nodes.map((node) => {
    const duplicates = findDuplicateCandidates(node.data, existing.map((item) => ({ id: item.id, data: item.data })));
    const duplicateOf = duplicates[0]?.id;
    const incomingEdges = edges.filter((edge) => edge.target === node.id).length;
    const outgoingEdges = edges.filter((edge) => edge.source === node.id).length;
    const quality = scoreKnowledgeQuality({
      node: node.data,
      incomingEdges,
      outgoingEdges,
      duplicateRisk: duplicates[0]?.score ?? 0
    });
    const status: ImportCandidate['status'] = duplicateOf ? 'review' : quality.total >= 0.45 ? 'accept' : 'review';
    return { node, duplicateOf, quality, status };
  });
}
