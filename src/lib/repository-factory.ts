import { InMemoryGraphRepository, type GraphRepository } from './graph-repository';
import { mathFoundationEdges, mathFoundationNodes } from '../data/math-foundation';

export type GraphStoreKind = 'memory' | 'postgres';

export interface DatabaseConfig {
  kind: GraphStoreKind;
  url?: string;
  maxConnections: number;
  statementTimeoutMs: number;
}

export function getDatabaseConfig(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  const kind: GraphStoreKind = env.GRAPH_STORE === 'postgres' ? 'postgres' : 'memory';
  return {
    kind,
    url: env.DATABASE_URL,
    maxConnections: Number(env.DATABASE_POOL_SIZE ?? 10),
    statementTimeoutMs: Number(env.DATABASE_STATEMENT_TIMEOUT_MS ?? 5000)
  };
}

export interface SqlExecutor {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export async function createGraphRepository(options?: { sql?: SqlExecutor }): Promise<GraphRepository> {
  const config = getDatabaseConfig();
  if (config.kind === 'postgres') {
    if (!options?.sql) throw new Error('GRAPH_STORE=postgres requires a SqlExecutor. Wire your preferred PostgreSQL driver at the deployment boundary.');
    const { PostgresGraphRepository } = await import('./postgres-graph-repository');
    return new PostgresGraphRepository(options.sql);
  }
  return new InMemoryGraphRepository(mathFoundationNodes, mathFoundationEdges);
}
