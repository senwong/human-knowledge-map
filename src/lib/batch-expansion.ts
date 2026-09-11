import type { CanonicalKnowledgeNode } from '../data/math-foundation';
import { normalizeKnowledgeLabel } from './dedupe';

export interface ExpansionSeed {
  id: string;
  label: string;
  domain: string;
  educationLevel: string;
  targetChildren: number;
}

export interface ExpansionBatch {
  id: string;
  seeds: ExpansionSeed[];
  maxProposals: number;
  instructions: string[];
}

export function buildExpansionBatch(nodes: CanonicalKnowledgeNode[], options: { domain?: string; maxSeeds?: number; childrenPerSeed?: number } = {}): ExpansionBatch {
  const maxSeeds = Math.max(1, Math.min(options.maxSeeds ?? 20, 100));
  const childrenPerSeed = Math.max(1, Math.min(options.childrenPerSeed ?? 6, 12));
  const selected = nodes
    .filter((node) => !options.domain || node.domain === options.domain)
    .sort((a, b) => a.difficulty - b.difficulty || a.label.localeCompare(b.label))
    .slice(0, maxSeeds);
  return {
    id: `expansion-${Date.now()}`,
    seeds: selected.map((node) => ({ id: node.id, label: node.label, domain: node.domain, educationLevel: node.educationLevel, targetChildren: childrenPerSeed })),
    maxProposals: selected.length * childrenPerSeed,
    instructions: [
      'Return atomic, independently teachable concepts only.',
      'Do not duplicate the seed, synonyms, or sibling concepts.',
      'Prefer prerequisite, contains, used_by, and generalizes relations.',
      'Every proposed node must include a concise learner-facing description.',
      'AI output remains a proposal until staging and review.'
    ]
  };
}

export function proposalStableId(domain: string, label: string) {
  const slug = normalizeKnowledgeLabel(`${domain}-${label}`)
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');
  return `proposal:${slug}`;
}
