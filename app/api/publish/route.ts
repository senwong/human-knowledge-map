import { NextResponse } from 'next/server';
import type { GraphChangeSet } from '../../../src/lib/graph-mutations';
import { createReleaseManifest, releaseFingerprint } from '../../../src/lib/release-manifest';

export async function POST(request: Request) {
  const body = await request.json() as { action?: 'publish' | 'rollback-plan'; changeSet?: GraphChangeSet; datasetIds?: string[]; nodeCount?: number; edgeCount?: number };
  if (!body.action || !body.changeSet) return NextResponse.json({ error: 'action and changeSet are required' }, { status: 400 });

  if (body.action === 'rollback-plan') {
    return NextResponse.json({
      action: 'rollback-plan',
      changeSetId: body.changeSet.id,
      mutationCount: body.changeSet.mutations.length,
      note: 'Rollback requires the pre-publication graph snapshot; this endpoint intentionally returns a plan rather than mutating canonical data.'
    });
  }

  const manifest = createReleaseManifest({
    dataVersion: `release-${Date.now()}`,
    schemaVersion: 1,
    datasetIds: body.datasetIds ?? [],
    changeSetIds: [body.changeSet.id],
    nodeCount: body.nodeCount ?? 0,
    edgeCount: body.edgeCount ?? 0
  });
  return NextResponse.json({ action: 'publish', status: 'planned', manifest, fingerprint: releaseFingerprint(manifest), note: 'Persistence is performed by the configured repository transaction layer.' }, { status: 202 });
}
