import type { CanonicalKnowledgeNode } from '../data/math-foundation';

function tokenize(value: string) {
  return value.normalize('NFKC').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

export class KnowledgeSearchIndex {
  private postings = new Map<string, Set<string>>();
  private byId = new Map<string, CanonicalKnowledgeNode>();

  constructor(nodes: CanonicalKnowledgeNode[]) {
    for (const node of nodes) {
      this.byId.set(node.id, node);
      const tokens = new Set([...tokenize(node.label), ...tokenize(node.domain), ...(node.aliases ?? []).flatMap(tokenize)]);
      for (const token of tokens) {
        const posting = this.postings.get(token) ?? new Set<string>();
        posting.add(node.id);
        this.postings.set(token, posting);
      }
    }
  }

  search(query: string, limit = 20) {
    const tokens = tokenize(query);
    if (!tokens.length) return [];
    const scores = new Map<string, number>();
    for (const token of tokens) {
      for (const [indexed, ids] of this.postings) {
        if (!indexed.includes(token) && !token.includes(indexed)) continue;
        for (const id of ids) scores.set(id, (scores.get(id) ?? 0) + (indexed === token ? 3 : 1));
      }
    }
    return [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, score]) => ({ node: this.byId.get(id)!, score }));
  }
}
