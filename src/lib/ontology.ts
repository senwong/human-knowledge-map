import type { KnowledgeNodeData, KnowledgeRelation } from '../types/knowledge';

export interface OntologyRule {
  domain: string;
  childKinds: Array<KnowledgeNodeData['type']>;
  preferredRelations: KnowledgeRelation[];
  maxChildren: number;
}

export const ontologyRules: OntologyRule[] = [
  { domain: '小学数学', childKinds: ['concept','skill'], preferredRelations: ['contains','prerequisite'], maxChildren: 8 },
  { domain: '数学', childKinds: ['concept','theorem','method'], preferredRelations: ['contains','prerequisite','generalizes'], maxChildren: 12 },
  { domain: '人工智能', childKinds: ['concept','method','research_topic'], preferredRelations: ['prerequisite','used_by','derived_from'], maxChildren: 12 }
];

export function getOntologyRule(domain: string): OntologyRule {
  return ontologyRules.find((rule) => rule.domain === domain) ?? {
    domain,
    childKinds: ['concept','skill','method'],
    preferredRelations: ['contains','related_to','prerequisite'],
    maxChildren: 10
  };
}

export function makeDecompositionPrompt(node: KnowledgeNodeData) {
  const rule = getOntologyRule(node.domain);
  return [
    `Decompose the knowledge concept "${node.label}" into atomic learnable knowledge nodes.`,
    `Domain: ${node.domain}. Education level: ${node.educationLevel}.`,
    `Allowed node types: ${rule.childKinds.join(', ')}.`,
    `Preferred relations: ${rule.preferredRelations.join(', ')}.`,
    `Return at most ${rule.maxChildren} children.`,
    'Every child must be independently teachable and should not duplicate its parent.'
  ].join('\n');
}
