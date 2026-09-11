import type { MapBounds, MapKnowledgeNode } from './map-layout';
import type { SqlExecutor } from './repository-factory';

type TileRow = {
  level: number;
  tile_x: number;
  tile_y: number;
  center_x: number;
  center_y: number;
  member_count: number;
  dominant_domain: string;
  avg_difficulty: number;
};

export function tileLevelForZoom(zoom: number) {
  if (zoom < 0.14) return 1;
  if (zoom < 0.24) return 2;
  if (zoom < 0.38) return 3;
  if (zoom < 0.58) return 4;
  return 5;
}

export async function queryMapTiles(sql: SqlExecutor, bounds: MapBounds, zoom: number, limit = 1200): Promise<MapKnowledgeNode[]> {
  const level = tileLevelForZoom(zoom);
  const size = 16384 / (2 ** level);
  const minTileX = Math.floor((bounds.minX + 8192) / size);
  const maxTileX = Math.floor((bounds.maxX + 8192) / size);
  const minTileY = Math.floor((bounds.minY + 8192) / size);
  const maxTileY = Math.floor((bounds.maxY + 8192) / size);

  const result = await sql.query<TileRow>(`
    SELECT level,tile_x,tile_y,center_x,center_y,member_count,dominant_domain,avg_difficulty
    FROM knowledge_map_tiles
    WHERE level=$1
      AND tile_x BETWEEN $2 AND $3
      AND tile_y BETWEEN $4 AND $5
    ORDER BY member_count DESC
    LIMIT $6
  `, [level, minTileX, maxTileX, minTileY, maxTileY, limit]);

  return result.rows.map((row) => ({
    id: `tile:${row.level}:${row.tile_x}:${row.tile_y}`,
    label: row.dominant_domain === 'mixed'
      ? `${row.member_count} 个知识点`
      : `${row.dominant_domain} · ${row.member_count}`,
    description: '',
    domain: row.dominant_domain,
    educationLevel: 'mixed',
    type: 'concept',
    difficulty: Math.max(1, Math.round(row.avg_difficulty)),
    aliases: [],
    x: Number(row.center_x),
    y: Number(row.center_y),
    isCluster: true,
    memberCount: row.member_count,
    clusterZoom: zoom
  }));
}
