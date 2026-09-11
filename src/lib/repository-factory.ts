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

let sharedSqlExecutor: SqlExecutor | undefined;

export async function createSqlExecutor(config: DatabaseConfig = getDatabaseConfig()): Promise<SqlExecutor> {
  if (sharedSqlExecutor) return sharedSqlExecutor;
  if (!config.url) throw new Error('DATABASE_URL is required when GRAPH_STORE=postgres.');

  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: config.url,
    max: config.maxConnections,
    statement_timeout: config.statementTimeoutMs,
    application_name: 'human-knowledge-map'
  });

  sharedSqlExecutor = {
    async query<T>(sql: string, params?: unknown[]) {
      const result = await pool.query(sql, params);
      return { rows: result.rows as T[] };
    }
  };
  return sharedSqlExecutor;
}

export async function createGraphRepository(options?: { sql?: SqlExecutor }): Promise<GraphRepository> {
  const config = getDatabaseConfig();
  if (config.kind === 'postgres') {
    const sql = options?.sql ?? await createSqlExecutor(config);
    const { PostgresGraphRepository } = await import('./postgres-graph-repository');
    return new PostgresGraphRepository(sql);
  }
  return new InMemoryGraphRepository(mathFoundationNodes, mathFoundationEdges);
}
