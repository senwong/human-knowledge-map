# Human Knowledge Map

A zoomable, explorable map of human knowledge — from primary-school concepts to research frontiers.

## Vision

Human Knowledge Map treats knowledge as a graph rather than a list of courses. The product combines three layers:

1. **Human Knowledge Graph** — what humanity knows.
2. **Curriculum Graph** — good ways to learn it.
3. **Personal Knowledge Graph** — what a learner already knows, is learning, or is likely to forget.

## Current version: v5.2

### Explorer and learning layer

- v1.3 Semantic Zoom
- v1.4 Domain Intelligence
- v1.5 Learner State
- v1.6 Forgetting Model
- v1.7 Recommendation Engine
- v1.8 Provenance
- v1.9 Graph Validation
- v2.0 Graph I/O
- v2.1 AI Expansion
- v2.2 Adaptive Explorer

### Knowledge data pipeline

- v2.3 Ontology Decomposition
- v2.4 Deduplication
- v2.5 Quality Scoring
- v2.6 Import Staging
- v2.7 Source Trust Policy
- v2.8 Growth Planner
- v2.9 Domain Bridges
- v3.0 Curriculum Ingestion
- v3.1 Graph Metrics
- v3.2 Dataset Registry

### Large-graph architecture

- v3.3 Math Foundation Dataset
- v3.4 Graph Repository
- v3.5 Spatial Index
- v3.6 LOD Clustering
- v3.7 Graph Query API
- v3.8 Graph Chunks
- v3.9 Search Index
- v4.0 Search API
- v4.1 Stress Graph Generator
- v4.2 Large Graph Lab

### Production data layer

- **v4.3 PostgreSQL Schema** — normalized nodes, edges, provenance and indexes for persistent graph storage.
- **v4.4 Graph Change Sets** — all edits are represented as atomic node/edge mutations.
- **v4.5 Version History** — commits change sets into numbered graph snapshots for rollback and auditing.
- **v4.6 Review Workflow** — draft → review → approved/rejected → published lifecycle.
- **v4.7 Ingestion Jobs** — tracks extraction, normalization, dedupe, validation and publication stages.
- **v4.8 Math Curriculum Catalog** — expands the curated mathematics backbone across arithmetic, algebra, geometry, calculus, linear algebra and probability.
- **v4.9 Canonical Merge Engine** — decides whether incoming concepts should insert, merge or enter human review.
- **v5.0 Review Queue API** — `GET/POST /api/review` provides the first backend surface for editorial review.
- **v5.1 Graph Event Log** — append-only incremental events make downstream sync and cache invalidation possible.
- **v5.2 PostgreSQL Repository Adapter** — implements the existing `GraphRepository` contract over SQL, including filters and recursive neighborhood traversal.

The central learning path remains easy to inspect:

`计数 → 自然数 → 加法 → 乘法 → 分数 → 代数 → 函数 → 微积分 / 线性代数 / 概率 → 神经网络 → Attention → Transformer → FlashAttention`

## Production knowledge lifecycle

```text
Curriculum / textbook / paper / expert / AI proposal
                    ↓
               Ingestion Job
                    ↓
        Normalize + dedupe + validate
                    ↓
             Canonical Merge
                    ↓
              Change Set
                    ↓
               Review Queue
                    ↓
                 Publish
                    ↓
         PostgreSQL Knowledge Store
                    ↓
             Graph Event Log
                    ↓
 Graph API / Search / LOD / viewport clients
```

The project intentionally separates proposals from canonical knowledge. AI-generated content never becomes authoritative merely because a model produced it.

## PostgreSQL

The initial schema is in `db/schema.sql`. `PostgresGraphRepository` is dependency-independent: provide a small SQL executor backed by your preferred PostgreSQL client.

## Run locally

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000` — adaptive knowledge explorer
- `http://localhost:3000/lab` — progressive large-graph lab

Type-check:

```bash
npm run typecheck
```

Generate a 100k-node stress dataset:

```bash
npm run stress:graph -- 100000 ./stress-graph.json
```

## DeepSeek

Copy `.env.example` to `.env.local` and set your key. `POST /api/expand` proposes AI-generated graph expansions. AI output must pass staging, provenance, deduplication, quality scoring, graph validation and review before publication.

## Stack

- Next.js
- React
- TypeScript
- React Flow
- PostgreSQL-ready repository layer
- DeepSeek API (optional graph expansion)

See `docs/ARCHITECTURE.md` and `docs/ROADMAP.md` for product and technical direction.
