import type { CanonicalKnowledgeEdge, CanonicalKnowledgeNode } from '../data/math-foundation';

export type GraphMutation =
  | { type: 'upsert-node'; node: CanonicalKnowledgeNode }
  | { type: 'delete-node'; nodeId: string }
  | { type: 'upsert-edge'; edge: CanonicalKnowledgeEdge }
  | { type: 'delete-edge'; edgeId: string };

export interface GraphChangeSet {
  id: string;
  author: string;
  reason: string;
  createdAt: string;
  mutations: GraphMutation[];
}

export interface MutableGraph {
  nodes: CanonicalKnowledgeNode[];
  edges: CanonicalKnowledgeEdge[];
}

export function applyChangeSet(graph: MutableGraph, changeSet: GraphChangeSet): MutableGraph {
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const edges = new Map(graph.edges.map((edge) => [edge.id, edge]));
  for (const mutation of changeSet.mutations) {
    if (mutation.type === 'upsert-node') nodes.set(mutation.node.id, mutation.node);
    if (mutation.type === 'delete-node') {
      nodes.delete(mutation.nodeId);
      for (const [id, edge] of edges) if (edge.source === mutation.nodeId || edge.target === mutation.nodeId) edges.delete(id);
    }
    if (mutation.type === 'upsert-edge') edges.set(mutation.edge.id, mutation.edge);
    if (mutation.type === 'delete-edge') edges.delete(mutation.edgeId);
  }
  return { nodes: [...nodes.values()], edges: [...edges.values()] };
}

export function summarizeChangeSet(changeSet: GraphChangeSet) {
  return changeSet.mutations.reduce<Record<GraphMutation['type'], number>>((summary, mutation) => {
    summary[mutation.type] += 1;
    return summary;
  }, { 'upsert-node': 0, 'delete-node': 0, 'upsert-edge': 0, 'delete-edge': 0 });
}
