export type SourceKind = 'textbook' | 'curriculum' | 'paper' | 'encyclopedia' | 'course' | 'expert' | 'ai';

export interface KnowledgeSource {
  id: string;
  title: string;
  url?: string;
  kind: SourceKind;
  publisher?: string;
  year?: number;
  peerReviewed?: boolean;
}

const baseTrust: Record<SourceKind, number> = {
  textbook: 0.88,
  curriculum: 0.9,
  paper: 0.86,
  encyclopedia: 0.78,
  course: 0.72,
  expert: 0.74,
  ai: 0.35
};

export function sourceTrust(source: KnowledgeSource) {
  let score = baseTrust[source.kind];
  if (source.peerReviewed) score += 0.08;
  if (source.publisher) score += 0.03;
  if (source.year && source.year >= new Date().getFullYear() - 5) score += 0.02;
  return Math.min(1, score);
}

export function combinedSourceTrust(sources: KnowledgeSource[]) {
  if (!sources.length) return 0;
  const independent = sources.map(sourceTrust).sort((a, b) => b - a);
  const best = independent[0];
  const corroboration = independent.slice(1).reduce((sum, score) => sum + score * 0.15, 0);
  return Math.min(1, best + corroboration);
}
