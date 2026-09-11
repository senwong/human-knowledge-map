# Human Knowledge Map

A zoomable, explorable map of human knowledge — from primary-school concepts to research frontiers.

## Vision

Human Knowledge Map treats knowledge as a graph rather than a list of courses. The product combines three layers:

1. **Human Knowledge Graph** — what humanity knows.
2. **Curriculum Graph** — good ways to learn it.
3. **Personal Knowledge Graph** — what a learner already knows, is learning, or is likely to forget.

## Current version: v6.2

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

- v4.3 PostgreSQL Schema
- v4.4 Graph Change Sets
- v4.5 Version History
- v4.6 Review Workflow
- v4.7 Ingestion Jobs
- v4.8 Math Curriculum Catalog
- v4.9 Canonical Merge Engine
- v5.0 Review Queue API
- v5.1 Graph Event Log
- v5.2 PostgreSQL Repository Adapter

### Knowledge operations layer

- **v5.3 Admin Console** — `/admin` becomes the operational surface for datasets, review and publishing.
- **v5.4 Repository Factory** — switch between in-memory and PostgreSQL-backed repositories through runtime configuration.
- **v5.5 Batch Expansion Planner** — creates bounded, ontology-aware AI expansion batches instead of uncontrolled generation.
- **v5.6 Import Preview** — previews insert / merge / review decisions and rejects dangling or self-referencing edges before publication.
- **v5.7 Publish Pipeline** — approved change sets become canonical graph releases through one controlled publish function.
- **v5.8 Expanded Math Curriculum Scaffold** — generates several hundred curriculum-shaped math scaffold nodes for ingestion and review experiments; these are explicitly non-authoritative until sourced and reviewed.
- **v5.9 Operations Metrics** — review backlog, dataset failures, approval rate and operational health indicators.
- **v6.0 Admin API** — `GET /api/admin` exposes canonical counts, curriculum scaffold size, dataset state and operational health.
- **v6.1 Release Manifest** — each knowledge data release records version, datasets, change sets, graph size and a deterministic fingerprint.
- **v6.2 Integrated Operations Dashboard** — `/admin` consumes the operations API and surfaces canonical size, scaffold size, review health and publishing status.

The central learning path remains easy to inspect:

`计数 → 自然数 → 加法 → 乘法 → 分数 → 代数 → 函数 → 微积分 / 线性代数 / 概率 → 神经网络 → Attention → Transformer → FlashAttention`

## Production knowledge lifecycle

```text
Curriculum / textbook / paper / expert / AI proposal
                    ↓
            Controlled expansion batch
                    ↓
               Ingestion Job
                    ↓
       Import preview / normalize / dedupe
                    ↓
             Canonical Merge
                    ↓
              Change Set
                    ↓
               Review Queue
                    ↓
              Publish Pipeline
                    ↓
             Release Manifest
                    ↓
         PostgreSQL Knowledge Store
                    ↓
             Graph Event Log
                    ↓
 Graph API / Search / LOD / viewport clients
```

AI-generated content never becomes canonical merely because a model produced it. Curriculum scaffold data is also treated as a proposal until mapped to sources and reviewed.

## Runtime storage

The initial PostgreSQL schema is in `db/schema.sql`. The repository layer is dependency-independent: wire any PostgreSQL client through the `SqlExecutor` interface.

```bash
GRAPH_STORE=memory
# or
GRAPH_STORE=postgres
DATABASE_URL=postgres://...
DATABASE_POOL_SIZE=10
DATABASE_STATEMENT_TIMEOUT_MS=5000
```

## Run locally

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000` — adaptive knowledge explorer
- `http://localhost:3000/lab` — progressive large-graph lab
- `http://localhost:3000/admin` — knowledge operations console
- `http://localhost:3000/api/admin` — operational summary API

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
