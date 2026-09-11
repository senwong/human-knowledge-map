import type { Edge } from '@xyflow/react';

export function findPath(start: string, end: string, edges: Edge[]): string[] {
  if (start === end) return [start];
  const graph = new Map<string, string[]>();
  for (const edge of edges) {
    const next = graph.get(edge.source) ?? [];
    next.push(edge.target);
    graph.set(edge.source, next);
  }
  const queue: string[][] = [[start]];
  const visited = new Set([start]);
  while (queue.length) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    for (const next of graph.get(current) ?? []) {
      if (visited.has(next)) continue;
      const candidate = [...path, next];
      if (next === end) return candidate;
      visited.add(next);
      queue.push(candidate);
    }
  }
  return [];
}
