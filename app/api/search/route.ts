import { NextRequest, NextResponse } from 'next/server';
import { mathFoundationNodes } from '../../../src/data/math-foundation';
import { KnowledgeSearchIndex } from '../../../src/lib/search-index';

const index = new KnowledgeSearchIndex(mathFoundationNodes);

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  const limit = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? 20)));
  if (!query) return NextResponse.json({ query, results: [] });
  const results = index.search(query, Number.isFinite(limit) ? limit : 20);
  return NextResponse.json({ query, results }, { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' } });
}
