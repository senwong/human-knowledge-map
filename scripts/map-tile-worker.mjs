import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const batchSize = Math.max(10, Number(process.env.MAP_TILE_BATCH_SIZE ?? 250));
const idleMs = Math.max(250, Number(process.env.MAP_TILE_IDLE_MS ?? 1500));
const pool = new Pool({
  connectionString,
  max: Math.max(1, Number(process.env.MAP_TILE_WORKER_POOL_SIZE ?? 2)),
  application_name: 'human-knowledge-map-tile-worker'
});

let stopping = false;
process.on('SIGTERM', () => { stopping = true; });
process.on('SIGINT', () => { stopping = true; });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function rebuildTile(client, tile) {
  const sizeResult = await client.query('SELECT knowledge_map_tile_size($1)::double precision AS size', [tile.level]);
  const size = Number(sizeResult.rows[0].size);
  const minX = tile.tile_x * size - 8192;
  const minY = tile.tile_y * size - 8192;
  const maxX = minX + size;
  const maxY = minY + size;

  const aggregate = await client.query(`
    SELECT
      count(*)::integer AS member_count,
      COALESCE(avg(map_x), 0)::double precision AS center_x,
      COALESCE(avg(map_y), 0)::double precision AS center_y,
      COALESCE(avg(difficulty), 1)::double precision AS avg_difficulty,
      COALESCE(mode() WITHIN GROUP (ORDER BY domain), 'mixed') AS dominant_domain
    FROM knowledge_nodes
    WHERE map_point <@ box(point($1,$2), point($3,$4))
  `, [minX, minY, maxX, maxY]);

  const row = aggregate.rows[0];
  if (row.member_count === 0) {
    await client.query('DELETE FROM knowledge_map_tiles WHERE level=$1 AND tile_x=$2 AND tile_y=$3', [tile.level, tile.tile_x, tile.tile_y]);
  } else {
    await client.query(`
      INSERT INTO knowledge_map_tiles(level,tile_x,tile_y,center_x,center_y,member_count,dominant_domain,avg_difficulty,updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now())
      ON CONFLICT (level,tile_x,tile_y) DO UPDATE SET
        center_x=EXCLUDED.center_x,
        center_y=EXCLUDED.center_y,
        member_count=EXCLUDED.member_count,
        dominant_domain=EXCLUDED.dominant_domain,
        avg_difficulty=EXCLUDED.avg_difficulty,
        updated_at=now()
    `, [tile.level, tile.tile_x, tile.tile_y, row.center_x, row.center_y, row.member_count, row.dominant_domain, row.avg_difficulty]);
  }

  await client.query('DELETE FROM knowledge_map_dirty_tiles WHERE level=$1 AND tile_x=$2 AND tile_y=$3', [tile.level, tile.tile_x, tile.tile_y]);
}

async function runBatch() {
  const client = await pool.connect();
  try {
    const dirty = await client.query(`
      SELECT level,tile_x,tile_y
      FROM knowledge_map_dirty_tiles
      ORDER BY queued_at
      LIMIT $1
    `, [batchSize]);

    for (const tile of dirty.rows) {
      await rebuildTile(client, tile);
      if (stopping) break;
    }
    return dirty.rowCount ?? 0;
  } finally {
    client.release();
  }
}

console.log(`map tile worker started (batch=${batchSize}, idle=${idleMs}ms)`);
while (!stopping) {
  try {
    const processed = await runBatch();
    if (processed === 0) await sleep(idleMs);
  } catch (error) {
    console.error('map tile worker error', error);
    await sleep(Math.max(idleMs, 3000));
  }
}

await pool.end();
console.log('map tile worker stopped');
