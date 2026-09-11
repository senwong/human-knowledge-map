import type { CanonicalKnowledgeEdge, CanonicalKnowledgeNode } from '../data/math-foundation';

export interface GraphChunk {
  id: string;
  nodeIds: string[];
  edgeCount: number;
  domains: string[];
}

export function partitionGraph(nodes: CanonicalKnowledgeNode[], edges: CanonicalKnowledgeEdge[], chunkSize = 500): GraphChunk[] {
  const size = Math.max(50, chunkSize);
  const chunks: GraphChunk[] = [];
  for (let offset = 0; offset < nodes.length; offset += size) {
    const slice = nodes.slice(offset, offset + size);
    const ids = new Set(slice.map((node) => node.id));
    chunks.push({
      id: `chunk-${Math.floor(offset / size)}`,
      nodeIds: slice.map((node) => node.id),
      edgeCount: edges.filter((edge) => ids.has(edge.source) || ids.has(edge.target)).length,
      domains: [...new Set(slice.map((node) => node.domain))]
    });
  }
  return chunks;
}

export function chunkManifest(chunks: GraphChunk[]) {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    chunks: chunks.map((chunk) => ({ id: chunk.id, nodes: chunk.nodeIds.length, edges: chunk.edgeCount, domains: chunk.domains }))
  };
}
