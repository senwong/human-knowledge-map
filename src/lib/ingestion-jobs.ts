import type { DatasetManifest } from './dataset-registry';

export type IngestionStage = 'queued' | 'extracting' | 'normalizing' | 'deduping' | 'validating' | 'review' | 'published' | 'failed';

export interface IngestionJob {
  id: string;
  dataset: DatasetManifest;
  stage: IngestionStage;
  processed: number;
  accepted: number;
  rejected: number;
  errors: string[];
  startedAt?: string;
  finishedAt?: string;
}

export function createIngestionJob(dataset: DatasetManifest): IngestionJob {
  return { id: `${dataset.id}:${Date.now()}`, dataset, stage: 'queued', processed: 0, accepted: 0, rejected: 0, errors: [] };
}

export function advanceIngestion(job: IngestionJob, stage: IngestionStage, patch: Partial<Pick<IngestionJob, 'processed' | 'accepted' | 'rejected' | 'errors'>> = {}): IngestionJob {
  const now = new Date().toISOString();
  return {
    ...job,
    ...patch,
    stage,
    startedAt: job.startedAt ?? now,
    finishedAt: stage === 'published' || stage === 'failed' ? now : undefined
  };
}
