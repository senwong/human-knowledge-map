import type { MutableGraph, GraphChangeSet } from './graph-mutations';
import { applyChangeSet } from './graph-mutations';

export interface GraphVersion {
  version: number;
  changeSetId: string;
  createdAt: string;
  nodeCount: number;
  edgeCount: number;
}

export class GraphHistory {
  private versions: GraphVersion[] = [];
  private snapshots = new Map<number, MutableGraph>();

  constructor(initial: MutableGraph) {
    this.snapshots.set(0, structuredClone(initial));
    this.versions.push({ version: 0, changeSetId: 'bootstrap', createdAt: new Date().toISOString(), nodeCount: initial.nodes.length, edgeCount: initial.edges.length });
  }

  commit(changeSet: GraphChangeSet) {
    const previous = this.snapshots.get(this.versions.at(-1)!.version)!;
    const next = applyChangeSet(previous, changeSet);
    const version = this.versions.at(-1)!.version + 1;
    this.snapshots.set(version, structuredClone(next));
    this.versions.push({ version, changeSetId: changeSet.id, createdAt: changeSet.createdAt, nodeCount: next.nodes.length, edgeCount: next.edges.length });
    return version;
  }

  list() { return [...this.versions]; }
  get(version: number) { return this.snapshots.get(version); }
  latest() { return this.get(this.versions.at(-1)!.version)!; }
}
