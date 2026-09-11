-- Incremental tile cache for million-scale map browsing.
CREATE TABLE IF NOT EXISTS knowledge_map_tiles (
  level SMALLINT NOT NULL,
  tile_x INTEGER NOT NULL,
  tile_y INTEGER NOT NULL,
  center_x DOUBLE PRECISION NOT NULL,
  center_y DOUBLE PRECISION NOT NULL,
  member_count INTEGER NOT NULL,
  dominant_domain TEXT NOT NULL DEFAULT 'mixed',
  avg_difficulty DOUBLE PRECISION NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (level, tile_x, tile_y)
);

CREATE TABLE IF NOT EXISTS knowledge_map_dirty_tiles (
  level SMALLINT NOT NULL,
  tile_x INTEGER NOT NULL,
  tile_y INTEGER NOT NULL,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (level, tile_x, tile_y)
);

CREATE INDEX IF NOT EXISTS knowledge_map_tiles_level_idx ON knowledge_map_tiles(level);
CREATE INDEX IF NOT EXISTS knowledge_map_dirty_tiles_queued_idx ON knowledge_map_dirty_tiles(queued_at);

CREATE OR REPLACE FUNCTION knowledge_map_tile_size(p_level INTEGER)
RETURNS DOUBLE PRECISION
LANGUAGE SQL IMMUTABLE PARALLEL SAFE
AS $$
  SELECT 16384.0 / power(2.0, greatest(0, least(8, p_level)));
$$;

CREATE OR REPLACE FUNCTION enqueue_knowledge_map_tiles(px DOUBLE PRECISION, py DOUBLE PRECISION)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  lvl INTEGER;
  size DOUBLE PRECISION;
  tx INTEGER;
  ty INTEGER;
BEGIN
  IF px IS NULL OR py IS NULL THEN RETURN; END IF;
  FOR lvl IN 0..6 LOOP
    size := knowledge_map_tile_size(lvl);
    tx := floor((px + 8192.0) / size);
    ty := floor((py + 8192.0) / size);
    INSERT INTO knowledge_map_dirty_tiles(level, tile_x, tile_y)
    VALUES (lvl, tx, ty)
    ON CONFLICT (level, tile_x, tile_y) DO UPDATE SET queued_at = now();
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION mark_knowledge_map_tiles_dirty()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    PERFORM enqueue_knowledge_map_tiles(OLD.map_x, OLD.map_y);
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM enqueue_knowledge_map_tiles(NEW.map_x, NEW.map_y);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS knowledge_nodes_map_tiles_dirty ON knowledge_nodes;
CREATE TRIGGER knowledge_nodes_map_tiles_dirty
AFTER INSERT OR UPDATE OF map_x, map_y, domain, difficulty OR DELETE ON knowledge_nodes
FOR EACH ROW EXECUTE FUNCTION mark_knowledge_map_tiles_dirty();

-- Seed the dirty queue once for existing data. The worker will populate tiles lazily.
INSERT INTO knowledge_map_dirty_tiles(level, tile_x, tile_y)
SELECT DISTINCT
  lvl,
  floor((n.map_x + 8192.0) / knowledge_map_tile_size(lvl))::integer,
  floor((n.map_y + 8192.0) / knowledge_map_tile_size(lvl))::integer
FROM knowledge_nodes n
CROSS JOIN generate_series(0, 6) AS lvl
WHERE n.map_x IS NOT NULL AND n.map_y IS NOT NULL
ON CONFLICT DO NOTHING;
