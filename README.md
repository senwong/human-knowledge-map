# Human Knowledge Map

A zoomable, explorable map of human knowledge — from primary-school concepts to research frontiers.

## Vision

Human Knowledge Map treats knowledge as a graph rather than a list of courses. Each concept can connect to prerequisites, applications, related ideas, broader categories, and more advanced topics.

The long-term product combines three layers:

1. **Human Knowledge Graph** — what humanity knows.
2. **Curriculum Graph** — good ways to learn it.
3. **Personal Knowledge Graph** — what a learner already knows, is learning, or is likely to forget.

## Current version: v2.2

The project has evolved through ten consecutive iterations after the first prototype:

- **v1.3 Semantic Zoom** — viewport zoom changes the semantic level of visible knowledge.
- **v1.4 Domain Intelligence** — domain summaries and graph statistics.
- **v1.5 Learner State** — personal mastery and learning status persist in local storage.
- **v1.6 Forgetting Model** — retention score and review priority.
- **v1.7 Recommendation Engine** — recommends review items and reachable next concepts.
- **v1.8 Provenance** — source type, confidence and citation-ready knowledge metadata.
- **v1.9 Graph Validation** — missing-node, self-loop and prerequisite-cycle checks.
- **v2.0 Graph I/O** — versioned JSON export/import model.
- **v2.1 AI Expansion** — DeepSeek-powered graph expansion API endpoint.
- **v2.2 Adaptive Explorer** — integrates paths, semantic zoom, mastery, recommendations, provenance and graph health into one knowledge cockpit.

The demo graph currently connects primary mathematics to modern AI:

`自然数 → 加法 → 乘法 → 分数 → 方程 → 函数 → 向量 → 矩阵 → 线性代数 → 概率论 → 神经网络 → Attention → Transformer`

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

Type-check:

```bash
npm run typecheck
```

## DeepSeek

Copy `.env.example` to `.env.local` and set your key:

```bash
cp .env.example .env.local
```

The graph expansion endpoint is available at `POST /api/expand` with a body such as:

```json
{
  "topic": "Transformer",
  "depth": 6
}
```

Generated graph data should be treated as a proposal until it passes validation and provenance review.

## Docker

```bash
./scripts/start.sh
```

## Stack

- Next.js
- React
- TypeScript
- React Flow
- DeepSeek API (optional graph expansion)

See `docs/ARCHITECTURE.md` and `docs/ROADMAP.md` for the product and technical direction.
