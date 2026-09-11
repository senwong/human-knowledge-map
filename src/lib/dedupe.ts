import type { KnowledgeNodeData } from '../types/knowledge';

export function normalizeKnowledgeLabel(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ' ')
    .replace(/[()（）【】\[\]]/g, '');
}

export function tokenSimilarity(a: string, b: string) {
  const left = new Set(normalizeKnowledgeLabel(a).split(' ').filter(Boolean));
  const right = new Set(normalizeKnowledgeLabel(b).split(' ').filter(Boolean));
  if (!left.size && !right.size) return 1;
  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return union ? intersection / union : 0;
}

export function findDuplicateCandidates(
  incoming: KnowledgeNodeData,
  existing: Array<{ id: string; data: KnowledgeNodeData }>,
  threshold = 0.8
) {
  const names = [incoming.label, ...(incoming.aliases ?? [])];
  return existing
    .map((node) => {
      const existingNames = [node.data.label, ...(node.data.aliases ?? [])];
      const score = Math.max(...names.flatMap((name) => existingNames.map((candidate) => tokenSimilarity(name, candidate))));
      return { id: node.id, score };
    })
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score);
}
