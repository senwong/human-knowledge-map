import { NextRequest, NextResponse } from 'next/server';
import { mathFoundationEdges, mathFoundationNodes } from '../../../../src/data/math-foundation';
import { InMemoryGraphRepository } from '../../../../src/lib/graph-repository';
import { clusterForZoom, type MapBounds } from '../../../../src/lib/map-layout';
import { createGraphRepository } from '../../../../src/lib/repository-factory';

function numberParam(request: NextRequest, key: string, fallback: number) {
  const value = Number(request.nextUrl.searchParams.get(key));
  return Number.isFinite(value) ? value : fallback;
}

export async function GET(request: NextRequest) {
  const bounds: MapBounds = {
    minX: numberParam(request, 'minX', -6000),
    minY: numberParam(request, 'minY', -6000),
    maxX: numberParam(request, 'maxX', 6000),
    maxY: numberParam(request, 'maxY', 6000)
  };
  const zoom = Math.max(0.05, numberParam(request, 'zoom', 1));
  const limit = Math.min(5000, Math.max(100, numberParam(request, 'limit', 2500)));

  let repository = await createGraphRepository();
  let slice = await repository.viewport(bounds, limit);
  let source: 'repository' | 'canonical-seed' = 'repository';

  // Fresh PostgreSQL deployments can be schema-only before canonical seeding.
  if (slice.total === 0) {
    repository = new InMemoryGraphRepository(mathFoundationNodes, mathFoundationEdges);
    slice = await repository.viewport(bounds, limit);
    source = 'canonical-seed';
  }

  const nodes = clusterForZoom(slice.nodes, zoom);
  const clustered = nodes.some((node) => node.isCluster);
  const visible = new Set(nodes.filter((node) => !node.isCluster).map((node) => node.id));
  const edges = clustered
    ? slice.edges.filter((edge) => visible.has(edge.source) && visible.has(edge.target))
    : slice.edges;

  return NextResponse.json({
    nodes,
    edges,
    total: slice.total,
    source,
    lod: clustered ? 'cluster' : 'node',
    zoom,
    bounds
  }, {
    headers: { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=60' }
  });
}
