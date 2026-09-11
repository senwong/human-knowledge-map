# Human Knowledge Map

A zoomable, explorable map of human knowledge — from primary-school concepts to research frontiers.

## Vision

Human Knowledge Map treats knowledge as a graph rather than a list of courses. The product combines three layers:

1. **Human Knowledge Graph** — what humanity knows.
2. **Curriculum Graph** — good ways to learn it.
3. **Personal Knowledge Graph** — what a learner already knows, is learning, or is likely to forget.

## Current version: v7.2

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

- v5.3 Admin Console
- v5.4 Repository Factory
- v5.5 Batch Expansion Planner
- v5.6 Import Preview
- v5.7 Publish Pipeline
- v5.8 Expanded Math Curriculum Scaffold
- v5.9 Operations Metrics
- v6.0 Admin API
- v6.1 Release Manifest
- v6.2 Integrated Operations Dashboard

### Maintenance and editorial layer

- **v6.3 Database Migration Registry** — ordered migration metadata and review/history SQL migration.
- **v6.4 Canonical Seed Planner** — builds safe, reproducible seed batches before persistence.
- **v6.5 Review Diff Engine** — converts change-set mutations into reviewer-friendly diffs and counts.
- **v6.6 Rollback Planner** — creates inverse change sets from pre-publication snapshots.
- **v6.7 Review Workspace** — `/admin/review` provides an editorial workspace for inspecting queued change sets and notes.
- **v6.8 Controlled Generation Console** — `/admin/generate` exposes bounded AI proposal generation without bypassing review.
- **v6.9 Provenance Coverage** — measures sourced, reviewed and verified coverage and identifies missing provenance.
- **v7.0 Canonical Math Seed** — mathematics nodes are packaged with explicit provenance/review status; internal editorial review is not treated as external certification.
- **v7.1 Publish / Rollback API** — `POST /api/publish` returns release manifests or rollback plans while keeping canonical mutation behind the repository transaction layer.
- **v7.2 Knowledge Quality Dashboard** — `/admin/quality` surfaces provenance coverage and missing-source work.

The central learning path remains easy to inspect:

`计数 → 自然数 → 加法 → 乘法 → 分数 → 代数 → 函数 → 微积分 / 线性代数 / 概率 → 神经网络 → Attention → Transformer → FlashAttention`

## Knowledge lifecycle

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
              Review Diff
                    ↓
             Editorial Review
                    ↓
              Publish Plan
                    ↓
             Release Manifest
                    ↓
         PostgreSQL Knowledge Store
                    ↓
             Graph Event Log
                    ↓
 Graph API / Search / LOD / viewport clients
```

AI-generated content never becomes canonical merely because a model produced it. Curriculum scaffold data is also treated as a proposal until mapped to sources and reviewed. `reviewed` means internal editorial review; stronger `verified` status is reserved for a stricter external-source verification workflow.

## Database and runtime storage

The initial PostgreSQL schema is in `db/schema.sql`; later migrations are tracked in `db/migrations/` and `src/lib/migrations.ts`.

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
- `http://localhost:3000/admin/review` — change-set review workspace
- `http://localhost:3000/admin/generate` — controlled AI generation console
- `http://localhost:3000/admin/quality` — provenance and editorial quality dashboard
- `http://localhost:3000/api/admin` — operational summary API
- `POST /api/publish` — release or rollback planning API

Type-check:

```bash
npm run typecheck
```

Generate a 100k-node stress dataset:

```bash
npm run stress:graph -- 100000 ./stress-graph.json
```

## Docker deployment

The application image is based on Debian Bookworm and configures the default APT source to:

```text
https://mirrors.ustc.edu.cn/debian
```

The default Compose stack runs the Next.js application together with PostgreSQL 17 (Debian Bookworm).

Prepare environment variables:

```bash
cp .env.example .env
# edit POSTGRES_PASSWORD and DEEPSEEK_API_KEY
```

Start the full stack:

```bash
sh scripts/deploy.sh up
```

Useful commands:

```bash
sh scripts/deploy.sh status
sh scripts/deploy.sh logs
sh scripts/deploy.sh restart
sh scripts/deploy.sh pull
sh scripts/deploy.sh down
```

Apply database schema and migrations manually:

```bash
sh scripts/migrate.sh
```

The legacy convenience command also starts the Compose stack:

```bash
sh scripts/start.sh
```

By default the service listens on port `3000`. Override it in `.env` with `PORT=8080` or another port.

`reset-db` deletes the PostgreSQL Docker volume and all persisted knowledge data, and therefore requires typing `RESET` interactively:

```bash
sh scripts/deploy.sh reset-db
```

## DeepSeek

Copy `.env.example` to `.env.local` for a non-Docker local environment and set your key. `POST /api/expand` proposes AI-generated graph expansions. AI output must pass staging, provenance, deduplication, quality scoring, graph validation and review before publication.

## Stack

- Next.js
- React
- TypeScript
- React Flow
- PostgreSQL-backed repository layer
- Docker / Docker Compose
- DeepSeek API (optional graph expansion)

See `docs/ARCHITECTURE.md` and `docs/ROADMAP.md` for product and technical direction.
