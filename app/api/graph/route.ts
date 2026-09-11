import { NextRequest, NextResponse } from 'next/server';
import { mathFoundationEdges, mathFoundationNodes } from '../../../src/data/math-foundation';
import { InMemoryGraphRepository } from '../../../src/lib/graph-repository';

const repository = new InMemoryGraphRepository(mathFoundationNodes, mathFoundationEdges);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const nodeId = params.get('node');
  if (nodeId) {
    const depth = Number(params.get('depth') ?? 1);
    const result = await repository.neighbors(nodeId, Number.isFinite(depth) ? depth : 1);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
  }

  const limit = Number(params.get('limit') ?? 200);
  const offset = Number(params.get('offset') ?? 0);
  const result = await repository.query({
    domain: params.get('domain') ?? undefined,
    educationLevel: params.get('level') ?? undefined,
    limit: Number.isFinite(limit) ? limit : 200,
    offset: Number.isFinite(offset) ? offset : 0
  });

  return NextResponse.json(result, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
}
