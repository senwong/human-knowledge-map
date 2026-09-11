import type { GraphChangeSet, GraphMutation } from './graph-mutations';

export interface ReviewDiffItem {
  kind: GraphMutation['type'];
  key: string;
  summary: string;
}

export function buildReviewDiff(changeSet: GraphChangeSet): ReviewDiffItem[] {
  return changeSet.mutations.map((mutation) => {
    if (mutation.type === 'upsert-node') return { kind: mutation.type, key: mutation.node.id, summary: `Upsert node: ${mutation.node.label}` };
    if (mutation.type === 'delete-node') return { kind: mutation.type, key: mutation.nodeId, summary: `Delete node: ${mutation.nodeId}` };
    if (mutation.type === 'upsert-edge') return { kind: mutation.type, key: mutation.edge.id, summary: `Upsert edge: ${mutation.edge.source} → ${mutation.edge.target} (${mutation.edge.relation})` };
    return { kind: mutation.type, key: mutation.edgeId, summary: `Delete edge: ${mutation.edgeId}` };
  });
}

export function diffStats(items: ReviewDiffItem[]) {
  return items.reduce<Record<GraphMutation['type'], number>>((acc, item) => {
    acc[item.kind] += 1;
    return acc;
  }, { 'upsert-node': 0, 'delete-node': 0, 'upsert-edge': 0, 'delete-edge': 0 });
}
