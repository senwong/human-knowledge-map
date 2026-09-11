import type { LearnerRecord } from '../hooks/use-learner-state';

const DAY = 24 * 60 * 60 * 1000;

export function retentionScore(record: LearnerRecord, now = Date.now()) {
  if (!record.lastReviewedAt) return record.mastery;
  const elapsedDays = Math.max(0, (now - new Date(record.lastReviewedAt).getTime()) / DAY);
  const stabilityDays = Math.max(1, 2 + record.mastery / 8);
  const retention = Math.exp(-elapsedDays / stabilityDays);
  return Math.max(0, Math.min(100, Math.round(record.mastery * retention)));
}

export function reviewPriority(record: LearnerRecord, now = Date.now()) {
  const retention = retentionScore(record, now);
  const masteryGap = 100 - record.mastery;
  return Math.round((100 - retention) * 0.7 + masteryGap * 0.3);
}

export function shouldReview(record: LearnerRecord, threshold = 70) {
  return retentionScore(record) < threshold && record.status !== 'unlearned';
}
