export interface KnowledgeReleaseManifest {
  id: string;
  dataVersion: string;
  schemaVersion: number;
  createdAt: string;
  nodeCount: number;
  edgeCount: number;
  datasetIds: string[];
  changeSetIds: string[];
  previousReleaseId?: string;
  notes?: string;
}

export function createReleaseManifest(input: Omit<KnowledgeReleaseManifest, 'id'|'createdAt'>): KnowledgeReleaseManifest {
  const createdAt = new Date().toISOString();
  return {
    ...input,
    id: `release:${input.dataVersion}:${createdAt}`,
    createdAt,
    datasetIds: [...new Set(input.datasetIds)].sort(),
    changeSetIds: [...new Set(input.changeSetIds)].sort()
  };
}

export function diffRelease(previous: KnowledgeReleaseManifest, next: KnowledgeReleaseManifest) {
  return {
    nodes: next.nodeCount - previous.nodeCount,
    edges: next.edgeCount - previous.edgeCount,
    datasetsAdded: next.datasetIds.filter((id) => !previous.datasetIds.includes(id)),
    changeSetsAdded: next.changeSetIds.filter((id) => !previous.changeSetIds.includes(id))
  };
}

export function releaseFingerprint(manifest: KnowledgeReleaseManifest) {
  const payload = [manifest.dataVersion, manifest.schemaVersion, manifest.nodeCount, manifest.edgeCount, manifest.datasetIds.join(','), manifest.changeSetIds.join(',')].join('|');
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
