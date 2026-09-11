'use client';

import { useEffect, useRef } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import type { CanonicalKnowledgeEdge } from '../data/math-foundation';
import type { LearnerState } from '../hooks/use-learner-state';
import type { MapBounds, MapKnowledgeNode } from '../lib/map-layout';

interface WebglKnowledgeMapProps {
  nodes: MapKnowledgeNode[];
  edges: CanonicalKnowledgeEdge[];
  learner: LearnerState;
  selectedId: string | null;
  query: string;
  onNodeClick: (id: string) => void;
  onNodeDoubleClick: (id: string) => void;
  onViewportChange?: (bounds: MapBounds, zoom: number) => void;
}

const statusColor: Record<string, string> = {
  mastered: '#34d399',
  learning: '#38bdf8',
  weak: '#fb7185',
  review: '#fbbf24',
  unlearned: '#64748b'
};

function edgeKey(edge: CanonicalKnowledgeEdge) {
  return `${edge.source}:${edge.relation}:${edge.target}`;
}

export function WebglKnowledgeMap({ nodes, edges, learner, selectedId, query, onNodeClick, onNodeDoubleClick, onViewportChange }: WebglKnowledgeMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const rendererRef = useRef<Sigma | null>(null);
  const selectedRef = useRef<string | null>(selectedId);
  const queryRef = useRef(query);
  const learnerRef = useRef(learner);
  const clickRef = useRef(onNodeClick);
  const doubleClickRef = useRef(onNodeDoubleClick);
  const viewportRef = useRef(onViewportChange);

  selectedRef.current = selectedId;
  queryRef.current = query;
  learnerRef.current = learner;
  clickRef.current = onNodeClick;
  doubleClickRef.current = onNodeDoubleClick;
  viewportRef.current = onViewportChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({ multi: true, type: 'directed' });
    const renderer = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      hideEdgesOnMove: true,
      labelDensity: 0.75,
      labelGridCellSize: 100,
      labelRenderedSizeThreshold: 7,
      minCameraRatio: 0.03,
      maxCameraRatio: 20,
      nodeReducer: (node, data) => {
        const selected = selectedRef.current === node;
        const text = queryRef.current.trim().toLowerCase();
        const searchable = `${data.label ?? ''} ${data.domain ?? ''} ${data.educationLevel ?? ''}`.toLowerCase();
        const matches = !text || searchable.includes(text);
        const isCluster = Boolean(data.isCluster);
        const status = learnerRef.current[node]?.status ?? 'unlearned';
        const baseSize = Number(data.size ?? 7);
        return {
          ...data,
          color: isCluster ? '#8b5cf6' : selected ? '#a78bfa' : statusColor[status] ?? '#64748b',
          size: isCluster ? Math.max(baseSize, 10) : selected ? Math.max(baseSize * 1.6, 11) : baseSize,
          hidden: false,
          forceLabel: isCluster || selected || matches,
          label: matches || selected || isCluster ? data.label : undefined,
          zIndex: selected || isCluster ? 2 : 0
        };
      },
      edgeReducer: (_edge, data) => ({ ...data, color: '#334155', size: 0.65 })
    });

    let viewportTimer: ReturnType<typeof setTimeout> | undefined;
    const emitViewport = () => {
      if (!viewportRef.current) return;
      if (viewportTimer) clearTimeout(viewportTimer);
      viewportTimer = setTimeout(() => {
        const dimensions = renderer.getDimensions();
        const topLeft = renderer.viewportToGraph({ x: 0, y: 0 });
        const bottomRight = renderer.viewportToGraph({ x: dimensions.width, y: dimensions.height });
        const marginX = Math.abs(bottomRight.x - topLeft.x) * 0.25;
        const marginY = Math.abs(bottomRight.y - topLeft.y) * 0.25;
        const bounds: MapBounds = {
          minX: Math.min(topLeft.x, bottomRight.x) - marginX,
          maxX: Math.max(topLeft.x, bottomRight.x) + marginX,
          minY: Math.min(topLeft.y, bottomRight.y) - marginY,
          maxY: Math.max(topLeft.y, bottomRight.y) + marginY
        };
        const ratio = Math.max(0.001, renderer.getCamera().getState().ratio);
        viewportRef.current?.(bounds, 1 / ratio);
      }, 140);
    };

    renderer.getCamera().on('updated', emitViewport);
    renderer.on('clickNode', ({ node }) => {
      const data = graph.getNodeAttributes(node);
      if (data.isCluster) {
        const display = renderer.getNodeDisplayData(node);
        if (display) {
          const camera = renderer.getCamera();
          const state = camera.getState();
          camera.animate({ x: display.x, y: display.y, ratio: Math.max(0.03, state.ratio * 0.48) }, { duration: 260 });
        }
        return;
      }
      clickRef.current(node);
    });
    renderer.on('doubleClickNode', ({ node }) => {
      const data = graph.getNodeAttributes(node);
      if (!data.isCluster) doubleClickRef.current(node);
    });

    graphRef.current = graph;
    rendererRef.current = renderer;
    requestAnimationFrame(emitViewport);

    return () => {
      if (viewportTimer) clearTimeout(viewportTimer);
      renderer.getCamera().removeListener('updated', emitViewport);
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
      graph.addNode(node.id, {
        x: node.x,
        y: node.y,
        label: node.label,
        domain: node.domain,
        educationLevel: node.educationLevel,
        isCluster: Boolean(node.isCluster),
        memberCount: node.memberCount ?? 1,
        size: node.isCluster ? 8 + Math.min(18, Math.sqrt(node.memberCount ?? 1) * 2.2) : 5 + Math.min(8, node.difficulty * 0.45),
        color: node.isCluster ? '#8b5cf6' : statusColor[learnerRef.current[node.id]?.status ?? 'unlearned'] ?? '#64748b'
      });
    }

    for (const edge of edges) {
      if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) continue;
      graph.addEdgeWithKey(edgeKey(edge), edge.source, edge.target, {
        relation: edge.relation,
        size: 0.65,
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
