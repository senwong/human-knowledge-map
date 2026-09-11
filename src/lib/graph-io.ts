import type { Edge, Node } from '@xyflow/react';
import type { KnowledgeNodeData } from '../types/knowledge';

export interface KnowledgeGraphDocument {
  version: 1;
  exportedAt: string;
  nodes: Node<KnowledgeNodeData>[];
  edges: Edge[];
}

export function exportGraph(nodes: Node<KnowledgeNodeData>[], edges: Edge[]) {
  const document: KnowledgeGraphDocument = { version: 1, exportedAt: new Date().toISOString(), nodes, edges };
  return JSON.stringify(document, null, 2);
}

export function parseGraph(input: string): KnowledgeGraphDocument {
  const value = JSON.parse(input) as Partial<KnowledgeGraphDocument>;
  if (value.version !== 1 || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) throw new Error('Unsupported knowledge graph document.');
  return value as KnowledgeGraphDocument;
}

export function downloadGraph(nodes: Node<KnowledgeNodeData>[], edges: Edge[]) {
  const blob = new Blob([exportGraph(nodes, edges)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `human-knowledge-map-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
