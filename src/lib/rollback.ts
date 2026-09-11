import type { GraphChangeSet, GraphMutation, MutableGraph } from './graph-mutations';
import { canonicalEdgeId } from './graph-mutations';

export function invertChangeSet(before: MutableGraph, changeSet: GraphChangeSet): GraphChangeSet {
  const nodeById = new Map(before.nodes.map((node) => [node.id, node]));
  const edgeById = new Map(before.edges.map((edge) => [canonicalEdgeId(edge), edge]));
  const inverse: GraphMutation[] = [];

  for (const mutation of [...changeSet.mutations].reverse()) {
    if (mutation.type === 'upsert-node') {
      const previous = nodeById.get(mutation.node.id);
      inverse.push(previous ? { type: 'upsert-node', node: previous } : { type: 'delete-node', nodeId: mutation.node.id });
    } else if (mutation.type === 'delete-node') {
      const previous = nodeById.get(mutation.nodeId);
      if (previous) inverse.push({ type: 'upsert-node', node: previous });
    } else if (mutation.type === 'upsert-edge') {
      const edgeId = canonicalEdgeId(mutation.edge);
      const previous = edgeById.get(edgeId);
      inverse.push(previous ? { type: 'upsert-edge', edge: previous } : { type: 'delete-edge', edgeId });
    } else {
      const previous = edgeById.get(mutation.edgeId);
      if (previous) inverse.push({ type: 'upsert-edge', edge: previous });
    }
  }

  return {
    id: `rollback:${changeSet.id}:${Date.now()}`,
    author: 'rollback-planner',
    reason: `Rollback ${changeSet.id}`,
    createdAt: new Date().toISOString(),
    mutations: inverse
  };
}
