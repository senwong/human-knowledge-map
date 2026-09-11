-- Human Knowledge Map v4.3 production storage schema
CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  domain TEXT NOT NULL,
  education_level TEXT NOT NULL,
  difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 10),
  zoom_level SMALLINT NOT NULL,
  node_type TEXT NOT NULL,
  aliases JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  revision BIGINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_edges (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  relation TEXT NOT NULL,
  confidence DOUBLE PRECISION NOT NULL DEFAULT 1 CHECK (confidence BETWEEN 0 AND 1),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  revision BIGINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_id, target_id, relation)
);

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source_kind TEXT NOT NULL,
  url TEXT,
  publisher TEXT,
  published_year INTEGER,
  trust_score DOUBLE PRECISION CHECK (trust_score BETWEEN 0 AND 1),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS node_sources (
  node_id TEXT NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  evidence TEXT,
  PRIMARY KEY(node_id, source_id)
);

CREATE INDEX IF NOT EXISTS knowledge_nodes_domain_idx ON knowledge_nodes(domain);
CREATE INDEX IF NOT EXISTS knowledge_nodes_education_idx ON knowledge_nodes(education_level);
CREATE INDEX IF NOT EXISTS knowledge_nodes_label_lower_idx ON knowledge_nodes(lower(label));
CREATE INDEX IF NOT EXISTS knowledge_edges_source_idx ON knowledge_edges(source_id);
CREATE INDEX IF NOT EXISTS knowledge_edges_target_idx ON knowledge_edges(target_id);
