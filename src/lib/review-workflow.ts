import type { GraphChangeSet } from './graph-mutations';

export type ReviewStatus = 'draft' | 'in-review' | 'approved' | 'rejected' | 'published';

export interface ReviewRecord {
  changeSet: GraphChangeSet;
  status: ReviewStatus;
  reviewer?: string;
  notes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  publishedAt?: string;
}

export function submitForReview(record: ReviewRecord): ReviewRecord {
  if (record.status !== 'draft') throw new Error('Only draft change sets can be submitted.');
  return { ...record, status: 'in-review', submittedAt: new Date().toISOString() };
}

export function review(record: ReviewRecord, reviewer: string, approved: boolean, notes?: string): ReviewRecord {
  if (record.status !== 'in-review') throw new Error('Change set is not awaiting review.');
  return { ...record, status: approved ? 'approved' : 'rejected', reviewer, notes, reviewedAt: new Date().toISOString() };
}

export function publish(record: ReviewRecord): ReviewRecord {
  if (record.status !== 'approved') throw new Error('Only approved change sets can be published.');
  return { ...record, status: 'published', publishedAt: new Date().toISOString() };
}
