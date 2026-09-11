export interface PositionedNode { id: string; x: number; y: number; }
export interface Bounds { minX: number; minY: number; maxX: number; maxY: number; }

export class SpatialGridIndex<T extends PositionedNode> {
  private buckets = new Map<string, T[]>();
  constructor(private cellSize = 800) {}

  private key(x: number, y: number) {
    return `${Math.floor(x / this.cellSize)}:${Math.floor(y / this.cellSize)}`;
  }

  add(node: T) {
    const key = this.key(node.x, node.y);
    const bucket = this.buckets.get(key) ?? [];
    bucket.push(node);
    this.buckets.set(key, bucket);
  }

  addMany(nodes: T[]) { nodes.forEach((node) => this.add(node)); return this; }

  query(bounds: Bounds, limit = 5000): T[] {
    const startX = Math.floor(bounds.minX / this.cellSize);
    const endX = Math.floor(bounds.maxX / this.cellSize);
    const startY = Math.floor(bounds.minY / this.cellSize);
    const endY = Math.floor(bounds.maxY / this.cellSize);
    const result: T[] = [];
    for (let x = startX; x <= endX && result.length < limit; x += 1) {
      for (let y = startY; y <= endY && result.length < limit; y += 1) {
        const bucket = this.buckets.get(`${x}:${y}`) ?? [];
        for (const node of bucket) {
          if (node.x >= bounds.minX && node.x <= bounds.maxX && node.y >= bounds.minY && node.y <= bounds.maxY) {
            result.push(node);
            if (result.length >= limit) break;
          }
        }
      }
    }
    return result;
  }

  stats() { return { buckets: this.buckets.size, cellSize: this.cellSize }; }
}
