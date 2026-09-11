import type { CanonicalKnowledgeEdge, CanonicalKnowledgeNode } from '../data/math-foundation';

export interface GraphQuery {
  domain?: string;
  educationLevel?: string;
  ids?: string[];
  limit?: number;
  offset?: number;
}

export interface GraphSlice {
  nodes: CanonicalKnowledgeNode[];
  edges: CanonicalKnowledgeEdge[];
  total: number;
}

export interface GraphRepository {
  getNode(id: string): Promise<CanonicalKnowledgeNode | undefined>;
  query(query?: GraphQuery): Promise<GraphSlice>;
  neighbors(id: string, depth?: number): Promise<GraphSlice>;
}

export class InMemoryGraphRepository implements GraphRepository {
  private nodeById: Map<string, CanonicalKnowledgeNode>;

  constructor(private nodes: CanonicalKnowledgeNode[], private edges: CanonicalKnowledgeEdge[]) {
    this.nodeById = new Map(nodes.map((node) => [node.id, node]));
  }

  async getNode(id: string) { return this.nodeById.get(id); }

  async query(query: GraphQuery = {}): Promise<GraphSlice> {
    let filtered = this.nodes;
    if (query.ids?.length) {
      const ids = new Set(query.ids);
      filtered = filtered.filter((node) => ids.has(node.id));
    }
    if (query.domain) filtered = filtered.filter((node) => node.domain === query.domain);
    if (query.educationLevel) filtered = filtered.filter((node) => node.educationLevel === query.educationLevel);
    const total = filtered.length;
    const offset = Math.max(0, query.offset ?? 0);
    const limit = Math.min(1000, Math.max(1, query.limit ?? 200));
    const nodes = filtered.slice(offset, offset + limit);
    const visible = new Set(nodes.map((node) => node.id));
    const edges = this.edges.filter((edge) => visible.has(edge.source) && visible.has(edge.target));
    return { nodes, edges, total };
  }

  async neighbors(id: string, depth = 1): Promise<GraphSlice> {
    const visible = new Set([id]);
    let frontier = new Set([id]);
    for (let i = 0; i < Math.max(1, Math.min(depth, 4)); i += 1) {
      const next = new Set<string>();
      for (const edge of this.edges) {
        if (frontier.has(edge.source)) next.add(edge.target);
        if (frontier.has(edge.target)) next.add(edge.source);
      }
      frontier = new Set([...next].filter((nodeId) => !visible.has(nodeId)));
      frontier.forEach((nodeId) => visible.add(nodeId));
    }
    const nodes = [...visible].map((nodeId) => this.nodeById.get(nodeId)).filter((node): node is CanonicalKnowledgeNode => Boolean(node));
    const edges = this.edges.filter((edge) => visible.has(edge.source) && visible.has(edge.target));
    return { nodes, edges, total: nodes.length };
  }
}
