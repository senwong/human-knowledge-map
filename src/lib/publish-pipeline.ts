import type { MutableGraph } from './graph-mutations';
import { applyChangeSet } from './graph-mutations';
import type { ReviewRecord } from './review-workflow';
import { publish } from './review-workflow';

export interface PublishResult {
  graph: MutableGraph;
  review: ReviewRecord;
  version: string;
  publishedAt: string;
  mutationCount: number;
}

export function publishApprovedChangeSet(graph: MutableGraph, record: ReviewRecord, currentVersion: string): PublishResult {
  if (record.status !== 'approved') throw new Error('Publish pipeline requires an approved review record.');
  const nextGraph = applyChangeSet(graph, record.changeSet);
  const publishedReview = publish(record);
  const publishedAt = publishedReview.publishedAt ?? new Date().toISOString();
  return {
    graph: nextGraph,
    review: publishedReview,
    version: incrementDataVersion(currentVersion),
    publishedAt,
    mutationCount: record.changeSet.mutations.length
  };
}

export function incrementDataVersion(version: string) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) return '1.0.0';
  return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
}
