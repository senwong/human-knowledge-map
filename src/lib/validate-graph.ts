import type { Edge, Node } from '@xyflow/react';

export interface GraphValidationIssue {
  type: 'missing-node' | 'self-loop' | 'cycle';
  message: string;
  edgeId?: string;
}

export function validateGraph(nodes: Node[], edges: Edge[]): GraphValidationIssue[] {
  const issues: GraphValidationIssue[] = [];
  const ids = new Set(nodes.map((node) => node.id));

  for (const edge of edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) issues.push({ type: 'missing-node', edgeId: edge.id, message: `Edge ${edge.id} references a missing node.` });
    if (edge.source === edge.target) issues.push({ type: 'self-loop', edgeId: edge.id, message: `Edge ${edge.id} points to itself.` });
  }

  const adjacency = new Map<string, string[]>();
  edges.filter((edge) => edge.label === 'prerequisite').forEach((edge) => adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const dfs = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const next of adjacency.get(id) ?? []) if (dfs(next)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };

  for (const id of ids) {
    if (dfs(id)) {
      issues.push({ type: 'cycle', message: 'Prerequisite graph contains a cycle.' });
      break;
    }
  }

  return issues;
}
