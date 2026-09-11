import { NextRequest, NextResponse } from 'next/server';
import { mathFoundationEdges, mathFoundationNodes } from '../../../../src/data/math-foundation';
import { InMemoryGraphRepository } from '../../../../src/lib/graph-repository';
import { clusterForZoom, type MapBounds } from '../../../../src/lib/map-layout';
import { createGraphRepository, createSqlExecutor, getDatabaseConfig } from '../../../../src/lib/repository-factory';
import { queryMapTiles } from '../../../../src/lib/map-tile-store';
import { LruCache } from '../../../../src/lib/lru-cache';

const viewportCache = new LruCache<unknown>(300, 20000);

function numberParam(request: NextRequest, key: string, fallback: number) {
  const value = Number(request.nextUrl.searchParams.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function quantize(value: number, step: number) {
  return Math.round(value / step) * step;
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
  const cacheStep = zoom < 0.58 ? 128 : 48;
  const cacheKey = [
    quantize(bounds.minX, cacheStep), quantize(bounds.minY, cacheStep),
    quantize(bounds.maxX, cacheStep), quantize(bounds.maxY, cacheStep),
    Math.round(zoom * 20) / 20, limit
  ].join(':');
  const cached = viewportCache.get(cacheKey);
  if (cached) return NextResponse.json(cached, { headers: { 'Cache-Control': 'public, max-age=20, stale-while-revalidate=120', 'X-Map-Cache': 'HIT' } });

  const config = getDatabaseConfig();
  if (config.kind === 'postgres' && zoom < 0.58) {
    const sql = await createSqlExecutor(config);
    const tileNodes = await queryMapTiles(sql, bounds, zoom, Math.min(limit, 1500));
    if (tileNodes.length) {
      const payload = { nodes: tileNodes, edges: [], total: tileNodes.reduce((sum, node) => sum + (node.memberCount ?? 1), 0), source: 'repository' as const, lod: 'tile', zoom, bounds };
      viewportCache.set(cacheKey, payload);
      return NextResponse.json(payload, { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=180', 'X-Map-Cache': 'MISS' } });
    }
  }

  let repository = await createGraphRepository();
  let slice = await repository.viewport(bounds, limit);
  let source: 'repository' | 'canonical-seed' = 'repository';

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
  const payload = { nodes, edges, total: slice.total, source, lod: clustered ? 'cluster' : 'node', zoom, bounds };
  viewportCache.set(cacheKey, payload);

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=60', 'X-Map-Cache': 'MISS' }
  });
}
