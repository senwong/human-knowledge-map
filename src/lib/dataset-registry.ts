export type DatasetStatus = 'planned' | 'importing' | 'review' | 'published' | 'failed';

export interface DatasetManifest {
  id: string;
  name: string;
  domain: string;
  language: string;
  version: string;
  sourceUrl?: string;
  license?: string;
  status: DatasetStatus;
  nodeEstimate?: number;
  importedNodes?: number;
  importedEdges?: number;
  lastUpdatedAt?: string;
}

export interface DatasetRegistrySummary {
  datasets: number;
  published: number;
  importedNodes: number;
  importedEdges: number;
  domains: string[];
}

export function summarizeDatasets(manifests: DatasetManifest[]): DatasetRegistrySummary {
  return {
    datasets: manifests.length,
    published: manifests.filter((item) => item.status === 'published').length,
    importedNodes: manifests.reduce((sum, item) => sum + (item.importedNodes ?? 0), 0),
    importedEdges: manifests.reduce((sum, item) => sum + (item.importedEdges ?? 0), 0),
    domains: [...new Set(manifests.map((item) => item.domain))].sort()
  };
}

export function nextDatasetsToImport(manifests: DatasetManifest[], limit = 5) {
  return manifests
    .filter((item) => item.status === 'planned' || item.status === 'failed')
    .sort((a, b) => (b.nodeEstimate ?? 0) - (a.nodeEstimate ?? 0))
    .slice(0, limit);
}

export const starterDatasets: DatasetManifest[] = [
  {
    id: 'primary-math-cn',
    name: 'Primary Mathematics Curriculum Skeleton',
    domain: '数学',
    language: 'zh-CN',
    version: '0.1',
    status: 'planned'
  },
  {
    id: 'cs-foundations',
    name: 'Computer Science Foundations Skeleton',
    domain: '计算机科学',
    language: 'zh-CN',
    version: '0.1',
    status: 'planned'
  },
  {
    id: 'ai-research-frontier',
    name: 'AI Research Frontier Skeleton',
    domain: '人工智能',
    language: 'en',
    version: '0.1',
    status: 'planned'
  }
];
