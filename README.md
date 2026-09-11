# Human Knowledge Map

A zoomable, explorable map of human knowledge — from primary-school concepts to research frontiers.

## Vision

Human Knowledge Map treats knowledge as a graph rather than a list of courses. The product combines three layers:

1. **Human Knowledge Graph** — what humanity knows.
2. **Curriculum Graph** — good ways to learn it.
3. **Personal Knowledge Graph** — what a learner already knows, is learning, or is likely to forget.

## Current version: v4.2

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

### Real data and large-graph architecture

- **v3.3 Math Foundation Dataset** — curated concepts from counting and arithmetic through algebra, calculus, probability, linear algebra and modern AI prerequisites.
- **v3.4 Graph Repository** — storage-independent graph access abstraction with pagination and neighborhood traversal.
- **v3.5 Spatial Index** — grid-based viewport lookup so clients do not need the entire graph in memory.
- **v3.6 LOD Clustering** — level-of-detail clusters based on zoom and visible-node pressure.
- **v3.7 Graph Query API** — `GET /api/graph` supports pagination, domain filtering and local-neighborhood loading.
- **v3.8 Graph Chunks** — partition and manifest support for sharded graph delivery.
- **v3.9 Search Index** — lightweight Unicode-aware knowledge search.
- **v4.0 Search API** — `GET /api/search?q=...` for server-side knowledge discovery.
- **v4.1 Stress Graph Generator** — generates synthetic 100k-node datasets for performance work.
- **v4.2 Large Graph Lab** — `/lab` progressively loads graph slices and neighborhoods instead of rendering the entire graph.

The first curated path still demonstrates the central idea:

`计数 → 自然数 → 加法 → 乘法 → 分数 → 代数 → 函数 → 微积分 / 线性代数 / 概率 → 神经网络 → Attention → Transformer → FlashAttention`

## Large graph strategy

The browser should never receive the complete human knowledge graph. The intended flow is:

```text
Canonical Knowledge Store
        ↓
GraphRepository
        ↓
Spatial / domain / search indexes
        ↓
Chunk + neighborhood query API
        ↓
Viewport request
        ↓
LOD cluster or concrete nodes
        ↓
React Flow / future WebGL renderer
```

This allows the storage layer to evolve from the current in-memory repository to PostgreSQL, Neo4j or another graph service without rewriting the explorer.

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

Copy `.env.example` to `.env.local` and set your key. `POST /api/expand` proposes AI-generated graph expansions. AI output is never canonical by default; it must pass staging, provenance, deduplication, quality scoring and graph validation.

## Stack

- Next.js
- React
- TypeScript
- React Flow
- DeepSeek API (optional graph expansion)

See `docs/ARCHITECTURE.md` and `docs/ROADMAP.md` for the product and technical direction.
