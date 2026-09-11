import type { Edge, Node } from '@xyflow/react';
import type { KnowledgeNodeData } from '../types/knowledge';
import type { LearnerState } from '../hooks/use-learner-state';
import { reviewPriority, shouldReview } from './forgetting';

export interface Recommendation {
  nodeId: string;
  reason: string;
  score: number;
}

export function recommendNext(nodes: Node<KnowledgeNodeData>[], edges: Edge[], learner: LearnerState): Recommendation[] {
  const recommendations: Recommendation[] = [];
  for (const [nodeId, record] of Object.entries(learner)) {
    if (shouldReview(record)) recommendations.push({ nodeId, reason: '记忆保持率下降，建议复习', score: 200 + reviewPriority(record) });
  }

  for (const edge of edges) {
    const source = learner[edge.source];
    const target = learner[edge.target];
    if (source?.mastery >= 70 && (!target || target.mastery < 30)) {
      const node = nodes.find((n) => n.id === edge.target);
      if (node) recommendations.push({ nodeId: edge.target, reason: `已掌握前置知识 ${nodes.find((n) => n.id === edge.source)?.data.label ?? edge.source}`, score: 120 - node.data.difficulty });
    }
  }

  const seen = new Set<string>();
  return recommendations.sort((a, b) => b.score - a.score).filter((item) => !seen.has(item.nodeId) && seen.add(item.nodeId)).slice(0, 5);
}
