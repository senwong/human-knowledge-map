import type { KnowledgeRelation } from '../types/knowledge';

export interface CurriculumItem {
  code: string;
  title: string;
  grade?: string;
  subject: string;
  description?: string;
  prerequisites?: string[];
}

export interface CurriculumGraphRecord {
  id: string;
  label: string;
  domain: string;
  educationLevel: string;
  relationToParent?: KnowledgeRelation;
  sourceCode: string;
}

export function curriculumToGraph(items: CurriculumItem[]): CurriculumGraphRecord[] {
  return items.map((item) => ({
    id: `${item.subject}:${item.code}`.toLowerCase().replace(/[^a-z0-9:]+/g, '-'),
    label: item.title,
    domain: item.subject,
    educationLevel: item.grade ?? 'unknown',
    relationToParent: 'contains',
    sourceCode: item.code
  }));
}

export function prerequisiteLinks(items: CurriculumItem[]) {
  return items.flatMap((item) => (item.prerequisites ?? []).map((sourceCode) => ({
    sourceCode,
    targetCode: item.code,
    relation: 'prerequisite' as const
  })));
}
