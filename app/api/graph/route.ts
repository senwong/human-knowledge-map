import { NextRequest, NextResponse } from 'next/server';
import { mathFoundationEdges, mathFoundationNodes } from '../../../src/data/math-foundation';
import { InMemoryGraphRepository, type GraphRepository, type GraphSlice } from '../../../src/lib/graph-repository';
import { createGraphRepository } from '../../../src/lib/repository-factory';

const fallbackRepository = new InMemoryGraphRepository(mathFoundationNodes, mathFoundationEdges);

async function withSeedFallback(
  repository: GraphRepository,
  query: (repo: GraphRepository) => Promise<GraphSlice>
): Promise<GraphSlice & { source: 'repository' | 'canonical-seed' }> {
  const result = await query(repository);
  if (result.nodes.length > 0 || result.total > 0 || process.env.GRAPH_STORE !== 'postgres') {
    return { ...result, source: 'repository' };
  }
  const fallback = await query(fallbackRepository);
  return { ...fallback, source: 'canonical-seed' };
}

export async function GET(request: NextRequest) {
  const repository = await createGraphRepository();
  const params = request.nextUrl.searchParams;
  const nodeId = params.get('node');

  if (nodeId) {
    const depth = Number(params.get('depth') ?? 1);
    const safeDepth = Number.isFinite(depth) ? depth : 1;
    const result = await withSeedFallback(repository, (repo) => repo.neighbors(nodeId, safeDepth));
    return NextResponse.json(result, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
  }

  const limit = Number(params.get('limit') ?? 200);
  const offset = Number(params.get('offset') ?? 0);
  const safeLimit = Number.isFinite(limit) ? limit : 200;
  const safeOffset = Number.isFinite(offset) ? offset : 0;
  const result = await withSeedFallback(repository, (repo) => repo.query({
    domain: params.get('domain') ?? undefined,
    educationLevel: params.get('level') ?? undefined,
    limit: safeLimit,
    offset: safeOffset
  }));

  return NextResponse.json(result, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
}
