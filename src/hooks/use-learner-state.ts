'use client';

import { useEffect, useMemo, useState } from 'react';

export type LearningStatus = 'mastered' | 'learning' | 'weak' | 'review' | 'unlearned';
export interface LearnerRecord {
  status: LearningStatus;
  mastery: number;
  lastReviewedAt?: string;
}
export type LearnerState = Record<string, LearnerRecord>;

const STORAGE_KEY = 'human-knowledge-map:learner-state:v1';

export function useLearnerState(initial: LearnerState = {}) {
  const [state, setState] = useState<LearnerState>(initial);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const setRecord = (nodeId: string, patch: Partial<LearnerRecord>) => {
    setState((current) => ({
      ...current,
      [nodeId]: { status: 'unlearned', mastery: 0, ...current[nodeId], ...patch }
    }));
  };

  const progress = useMemo(() => {
    const records = Object.values(state);
    return records.length ? Math.round(records.reduce((sum, r) => sum + r.mastery, 0) / records.length) : 0;
  }, [state]);

  return { state, setRecord, progress };
}
