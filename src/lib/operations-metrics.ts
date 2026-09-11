import type { DatasetManifest } from './dataset-registry';
import type { ReviewRecord } from './review-workflow';

export interface KnowledgeOpsMetrics {
  reviewQueue: number;
  approvedWaitingPublish: number;
  rejected: number;
  datasetFailures: number;
  importingDatasets: number;
  publishedDatasets: number;
  reviewApprovalRate: number;
}

export function calculateKnowledgeOpsMetrics(reviews: ReviewRecord[], datasets: DatasetManifest[]): KnowledgeOpsMetrics {
  const reviewed = reviews.filter((record) => record.status === 'approved' || record.status === 'rejected');
  const approved = reviews.filter((record) => record.status === 'approved').length;
  return {
    reviewQueue: reviews.filter((record) => record.status === 'in-review').length,
    approvedWaitingPublish: approved,
    rejected: reviews.filter((record) => record.status === 'rejected').length,
    datasetFailures: datasets.filter((dataset) => dataset.status === 'failed').length,
    importingDatasets: datasets.filter((dataset) => dataset.status === 'importing').length,
    publishedDatasets: datasets.filter((dataset) => dataset.status === 'published').length,
    reviewApprovalRate: reviewed.length ? approved / reviewed.length : 0
  };
}

export function operationalHealth(metrics: KnowledgeOpsMetrics) {
  const blockers: string[] = [];
  if (metrics.datasetFailures > 0) blockers.push(`${metrics.datasetFailures} dataset import failures`);
  if (metrics.reviewQueue > 100) blockers.push('review queue exceeds 100 change sets');
  if (metrics.reviewApprovalRate > 0 && metrics.reviewApprovalRate < 0.5) blockers.push('approval rate below 50%; upstream generation quality may be poor');
  return { status: blockers.length ? 'attention' as const : 'healthy' as const, blockers };
}
