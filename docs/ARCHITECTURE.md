# Architecture

## Product model

Human Knowledge Map separates three graphs:

- **Human Knowledge Graph**: concepts and relationships that describe human knowledge.
- **Curriculum Graph**: pedagogical paths and sequencing rules for teaching those concepts.
- **Personal Knowledge Graph**: learner-specific mastery, weakness, review urgency and history.

## Core entities

### Knowledge node

A node has an id, title, description, domain, education level, difficulty, node type, aliases and a `zoomLevel` controlling when it should become visible.

### Knowledge edge

Edges are typed. Initial relationship types:

- prerequisite
- contains
- related_to
- used_by
- derived_from
- generalizes
- specializes

## Rendering strategy

v1 uses React Flow for fast product iteration. At larger scales, rendering should move toward a WebGL graph renderer with server-side neighborhood queries and level-of-detail aggregation.

The browser should never render the entire global graph. It should request a local neighborhood around the current focus and progressively reveal more detail as the user zooms.

## Future backend

Recommended path:

1. Local/static graph for MVP.
2. PostgreSQL for canonical nodes, users and curriculum metadata.
3. pgvector for semantic search and concept matching.
4. Neo4j or another graph-native store only when traversal requirements justify the operational cost.

## AI generation

LLMs may propose nodes, edges, explanations and learning paths, but generated knowledge should carry provenance and review state. The graph must distinguish authoritative, reviewed, generated and community-contributed assertions.
