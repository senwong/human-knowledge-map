import type { CanonicalKnowledgeNode } from '../data/math-foundation';
import type { KnowledgeSource } from './source-policy';

export interface NodeProvenanceRecord {
  nodeId: string;
  sources: KnowledgeSource[];
  reviewStatus: 'unreviewed' | 'reviewed' | 'verified';
}

export function provenanceCoverage(nodes: CanonicalKnowledgeNode[], records: NodeProvenanceRecord[]) {
  const byId = new Map(records.map((record) => [record.nodeId, record]));
  let sourced = 0;
  let reviewed = 0;
  let verified = 0;
  for (const node of nodes) {
    const record = byId.get(node.id);
    if (record?.sources.length) sourced += 1;
    if (record && record.reviewStatus !== 'unreviewed') reviewed += 1;
    if (record?.reviewStatus === 'verified') verified += 1;
  }
  const total = nodes.length || 1;
  return {
    total: nodes.length,
    sourced,
    reviewed,
    verified,
    sourcedPercent: Math.round((sourced / total) * 100),
    reviewedPercent: Math.round((reviewed / total) * 100),
    verifiedPercent: Math.round((verified / total) * 100),
    missingSourceIds: nodes.filter((node) => !(byId.get(node.id)?.sources.length)).map((node) => node.id)
  };
}
