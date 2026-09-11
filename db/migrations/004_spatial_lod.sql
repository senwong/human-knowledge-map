-- Persistent coordinates for viewport queries and WebGL LOD rendering.
ALTER TABLE knowledge_nodes ADD COLUMN IF NOT EXISTS map_x DOUBLE PRECISION;
ALTER TABLE knowledge_nodes ADD COLUMN IF NOT EXISTS map_y DOUBLE PRECISION;

-- Deterministic one-time fallback coordinates for existing rows. Application code
-- can later replace these with curated/layout-worker coordinates without changing IDs.
UPDATE knowledge_nodes
SET
  map_x = COALESCE(map_x, ((('x' || substr(md5(domain || ':' || id), 1, 8))::bit(32)::bigint % 200000) - 100000)::double precision / 20.0),
  map_y = COALESCE(map_y, ((('x' || substr(md5(id || ':' || domain), 1, 8))::bit(32)::bigint % 200000) - 100000)::double precision / 20.0)
WHERE map_x IS NULL OR map_y IS NULL;

CREATE INDEX IF NOT EXISTS knowledge_nodes_map_x_idx ON knowledge_nodes(map_x);
CREATE INDEX IF NOT EXISTS knowledge_nodes_map_y_idx ON knowledge_nodes(map_y);
CREATE INDEX IF NOT EXISTS knowledge_nodes_map_xy_idx ON knowledge_nodes(map_x, map_y);
