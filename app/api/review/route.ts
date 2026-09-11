import { NextResponse } from 'next/server';
import type { ReviewRecord } from '../../../src/lib/review-workflow';

const queue: ReviewRecord[] = [];

export async function GET() {
  return NextResponse.json({ items: queue, total: queue.length });
}

export async function POST(request: Request) {
  const body = await request.json() as Partial<ReviewRecord>;
  if (!body.changeSet) return NextResponse.json({ error: 'changeSet is required' }, { status: 400 });
  const record: ReviewRecord = { changeSet: body.changeSet, status: 'draft' };
  queue.push(record);
  return NextResponse.json(record, { status: 201 });
}
