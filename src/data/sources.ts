export type SourceKind = 'textbook' | 'curriculum' | 'paper' | 'encyclopedia' | 'expert' | 'ai';

export interface KnowledgeSource {
  id: string;
  title: string;
  kind: SourceKind;
  url?: string;
  publisher?: string;
  year?: number;
  confidence: number;
}

export const knowledgeSources: Record<string, KnowledgeSource[]> = {
  'natural-numbers': [
    { id: 'src-primary-math', title: 'Primary Mathematics Curriculum', kind: 'curriculum', publisher: 'Demo curriculum source', confidence: 0.95 }
  ],
  'linear-algebra': [
    { id: 'src-la-textbook', title: 'Linear Algebra reference', kind: 'textbook', publisher: 'Demo textbook source', confidence: 0.92 }
  ],
  'attention': [
    { id: 'src-attention-paper', title: 'Attention Is All You Need', kind: 'paper', year: 2017, url: 'https://arxiv.org/abs/1706.03762', confidence: 0.99 }
  ],
  'transformer': [
    { id: 'src-transformer-paper', title: 'Attention Is All You Need', kind: 'paper', year: 2017, url: 'https://arxiv.org/abs/1706.03762', confidence: 0.99 }
  ]
};

export function sourceConfidence(nodeId: string) {
  const sources = knowledgeSources[nodeId] ?? [];
  if (!sources.length) return 0;
  return Math.round((sources.reduce((sum, source) => sum + source.confidence, 0) / sources.length) * 100);
}
