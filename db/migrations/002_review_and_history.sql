CREATE TABLE IF NOT EXISTS graph_change_sets (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS graph_versions (
  version BIGSERIAL PRIMARY KEY,
  change_set_id TEXT REFERENCES graph_change_sets(id),
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_graph_change_sets_status ON graph_change_sets(status);
