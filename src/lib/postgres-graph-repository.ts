import type { CanonicalKnowledgeEdge, CanonicalKnowledgeNode } from '../data/math-foundation';
import type { GraphQuery, GraphRepository, GraphSlice } from './graph-repository';

export interface SqlExecutor {
  query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

type NodeRow = {
  id: string; label: string; domain: string; education_level: string; node_type: CanonicalKnowledgeNode['type']; difficulty: number; aliases: string[];
};
type EdgeRow = { source_id: string; target_id: string; relation: CanonicalKnowledgeEdge['relation'] };

const toNode = (row: NodeRow): CanonicalKnowledgeNode => ({ id: row.id, label: row.label, domain: row.domain, educationLevel: row.education_level, type: row.node_type, difficulty: row.difficulty, aliases: row.aliases ?? [] });
const toEdge = (row: EdgeRow): CanonicalKnowledgeEdge => ({ source: row.source_id, target: row.target_id, relation: row.relation });

export class PostgresGraphRepository implements GraphRepository {
  constructor(private db: SqlExecutor) {}

  async getNode(id: string) {
    const result = await this.db.query<NodeRow>('SELECT id,label,domain,education_level,node_type,difficulty,aliases FROM knowledge_nodes WHERE id=$1', [id]);
    return result.rows[0] ? toNode(result.rows[0]) : undefined;
  }

  async query(query: GraphQuery = {}): Promise<GraphSlice> {
    const clauses: string[] = [];
    const params: unknown[] = [];
    const add = (sql: string, value: unknown) => { params.push(value); clauses.push(sql.replace('?', `$${params.length}`)); };
    if (query.domain) add('domain=?', query.domain);
    if (query.educationLevel) add('education_level=?', query.educationLevel);
    if (query.ids?.length) add('id = ANY(?)', query.ids);
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const count = await this.db.query<{ count: string }>(`SELECT count(*)::text AS count FROM knowledge_nodes ${where}`, params);
    const limit = Math.min(1000, Math.max(1, query.limit ?? 200));
    const offset = Math.max(0, query.offset ?? 0);
    const nodeParams = [...params, limit, offset];
    const nodesResult = await this.db.query<NodeRow>(`SELECT id,label,domain,education_level,node_type,difficulty,aliases FROM knowledge_nodes ${where} ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, nodeParams);
    const nodes = nodesResult.rows.map(toNode);
    if (!nodes.length) return { nodes: [], edges: [], total: Number(count.rows[0]?.count ?? 0) };
    const ids = nodes.map((node) => node.id);
    const edgeResult = await this.db.query<EdgeRow>('SELECT source_id,target_id,relation FROM knowledge_edges WHERE source_id = ANY($1) AND target_id = ANY($1)', [ids]);
    return { nodes, edges: edgeResult.rows.map(toEdge), total: Number(count.rows[0]?.count ?? 0) };
  }

  async neighbors(id: string, depth = 1): Promise<GraphSlice> {
    const maxDepth = Math.max(1, Math.min(depth, 4));
    const result = await this.db.query<{ id: string }>(`WITH RECURSIVE walk(id,depth) AS (SELECT $1::text,0 UNION SELECT CASE WHEN e.source_id=w.id THEN e.target_id ELSE e.source_id END,w.depth+1 FROM walk w JOIN knowledge_edges e ON (e.source_id=w.id OR e.target_id=w.id) WHERE w.depth<$2) SELECT DISTINCT id FROM walk`, [id, maxDepth]);
    return this.query({ ids: result.rows.map((row) => row.id), limit: 1000 });
  }
}
