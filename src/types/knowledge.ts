export type KnowledgeRelation =
  | 'prerequisite'
  | 'contains'
  | 'related_to'
  | 'used_by'
  | 'derived_from'
  | 'generalizes'
  | 'specializes';

export type KnowledgeNodeType =
  | 'concept'
  | 'theorem'
  | 'skill'
  | 'method'
  | 'problem'
  | 'research_topic';

export type LearningStatus = 'mastered' | 'learning' | 'weak' | 'review' | 'unlearned';

export interface KnowledgeNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  domain: string;
  educationLevel: string;
  difficulty: number;
  zoomLevel: number;
  type: KnowledgeNodeType;
  aliases?: string[];
  learningStatus?: LearningStatus;
}
