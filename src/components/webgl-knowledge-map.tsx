'use client';

import { useEffect, useRef } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import type { CanonicalKnowledgeEdge, CanonicalKnowledgeNode } from '../data/math-foundation';
import type { LearnerState } from '../hooks/use-learner-state';

interface WebglKnowledgeMapProps {
  nodes: CanonicalKnowledgeNode[];
  edges: CanonicalKnowledgeEdge[];
  learner: LearnerState;
  selectedId: string | null;
  query: string;
  onNodeClick: (id: string) => void;
  onNodeDoubleClick: (id: string) => void;
}

const statusColor: Record<string, string> = {
  mastered: '#34d399',
  learning: '#38bdf8',
  weak: '#fb7185',
  review: '#fbbf24',
  unlearned: '#64748b'
};

function hash(input: string) {
  let value = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function stablePosition(node: CanonicalKnowledgeNode) {
  const domainHash = hash(node.domain);
  const nodeHash = hash(node.id);
  const domainAngle = ((domainHash % 360) * Math.PI) / 180;
  const domainRadius = 40 + (domainHash % 9) * 18;
  const localAngle = ((nodeHash % 360) * Math.PI) / 180;
  const localRadius = 6 + (nodeHash % 19) * 1.9 + node.difficulty * 1.5;
  return {
    x: Math.cos(domainAngle) * domainRadius + Math.cos(localAngle) * localRadius,
    y: Math.sin(domainAngle) * domainRadius + Math.sin(localAngle) * localRadius
  };
}

function edgeKey(edge: CanonicalKnowledgeEdge) {
  return `${edge.source}:${edge.relation}:${edge.target}`;
}

export function WebglKnowledgeMap({ nodes, edges, learner, selectedId, query, onNodeClick, onNodeDoubleClick }: WebglKnowledgeMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const rendererRef = useRef<Sigma | null>(null);
  const selectedRef = useRef<string | null>(selectedId);
  const queryRef = useRef(query);
  const learnerRef = useRef(learner);
  const clickRef = useRef(onNodeClick);
  const doubleClickRef = useRef(onNodeDoubleClick);

  selectedRef.current = selectedId;
  queryRef.current = query;
  learnerRef.current = learner;
  clickRef.current = onNodeClick;
  doubleClickRef.current = onNodeDoubleClick;

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({ multi: true, type: 'directed' });
    const renderer = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      hideEdgesOnMove: true,
      labelDensity: 0.8,
      labelGridCellSize: 90,
      labelRenderedSizeThreshold: 7,
      minCameraRatio: 0.05,
      maxCameraRatio: 8,
      nodeReducer: (node, data) => {
        const selected = selectedRef.current === node;
        const text = queryRef.current.trim().toLowerCase();
        const searchable = `${data.label ?? ''} ${data.domain ?? ''} ${data.educationLevel ?? ''}`.toLowerCase();
        const matches = !text || searchable.includes(text);
        const status = learnerRef.current[node]?.status ?? 'unlearned';
        return {
          ...data,
          color: selected ? '#a78bfa' : statusColor[status] ?? '#64748b',
          size: selected ? Math.max(Number(data.size ?? 7) * 1.6, 11) : Number(data.size ?? 7),
          hidden: false,
          forceLabel: selected || matches,
          label: matches || selected ? data.label : undefined,
          zIndex: selected ? 2 : 0
        };
      },
      edgeReducer: (_edge, data) => ({ ...data, color: '#334155', size: 0.7 })
    });

    renderer.on('clickNode', ({ node }) => clickRef.current(node));
    renderer.on('doubleClickNode', ({ node }) => doubleClickRef.current(node));

    graphRef.current = graph;
    rendererRef.current = renderer;

    return () => {
      renderer.kill();
      rendererRef.current = null;
      graphRef.current = null;
    };
  }, []);

  useEffect(() => {
    const graph = graphRef.current;
    const renderer = rendererRef.current;
    if (!graph || !renderer) return;

    graph.clear();

    for (const node of nodes) {
      const position = stablePosition(node);
      graph.addNode(node.id, {
        ...position,
        label: node.label,
        domain: node.domain,
        educationLevel: node.educationLevel,
        size: 5 + Math.min(8, node.difficulty * 0.45),
        color: statusColor[learnerRef.current[node.id]?.status ?? 'unlearned'] ?? '#64748b'
      });
    }

    for (const edge of edges) {
      if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) continue;
      graph.addEdgeWithKey(edgeKey(edge), edge.source, edge.target, {
        relation: edge.relation,
        size: 0.7,
        color: '#334155'
      });
    }

    renderer.refresh();
  }, [nodes, edges]);

  useEffect(() => {
    rendererRef.current?.refresh();
  }, [selectedId, query, learner]);

  return <div ref={containerRef} className="webgl-map" aria-label="WebGL knowledge graph" />;
}
