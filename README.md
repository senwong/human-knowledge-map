# Human Knowledge Map

A zoomable, explorable map of human knowledge — from primary-school concepts to research frontiers.

## Vision

Human Knowledge Map treats knowledge as a graph rather than a list of courses. Each concept can connect to prerequisites, applications, related ideas, broader categories, and more advanced topics.

The long-term product combines three layers:

1. **Human Knowledge Graph** — what humanity knows.
2. **Curriculum Graph** — good ways to learn it.
3. **Personal Knowledge Graph** — what a learner already knows, is learning, or is likely to forget.

## v1.0

The first version is an interactive Next.js knowledge-map prototype with:

- zoom and pan
- clickable knowledge nodes
- node detail panel
- search
- prerequisite / related / contains / used-by relationships
- a demo path from primary-school arithmetic to Transformer
- zoom-level filtering
- learning-status visualization hooks

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Docker

```bash
./scripts/start.sh
```

## Stack

- Next.js
- React
- TypeScript
- React Flow

See `docs/ARCHITECTURE.md` and `docs/ROADMAP.md` for the product and technical direction.
