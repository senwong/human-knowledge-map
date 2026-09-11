'use client';

import { useMemo, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Node
} from '@xyflow/react';
import { demoEdges, demoNodes, knowledgeById } from '../src/data/demo-graph';
import type { KnowledgeNodeData } from '../src/types/knowledge';

export default function Home() {
  const [nodes, , onNodesChange] = useNodesState(demoNodes);
  const [edges, , onEdgesChange] = useEdgesState(demoEdges);
  const [selectedId, setSelectedId] = useState<string | null>('natural-numbers');
  const [query, setQuery] = useState('');
  const [maxZoomLevel, setMaxZoomLevel] = useState(20);

  const filteredNodes = useMemo(() => {
    const text = query.trim().toLowerCase();
    return nodes.filter((node) => {
      const data = node.data as KnowledgeNodeData;
      const matchesZoom = data.zoomLevel <= maxZoomLevel;
      const matchesQuery = !text || data.label.toLowerCase().includes(text) || data.description.toLowerCase().includes(text);
      return matchesZoom && matchesQuery;
    });
  }, [nodes, query, maxZoomLevel]);

  const visibleIds = useMemo(() => new Set(filteredNodes.map((node) => node.id)), [filteredNodes]);
  const filteredEdges = edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
  const selected = selectedId ? knowledgeById[selectedId] : undefined;

  const handleNodeClick = (_: React.MouseEvent, node: Node) => setSelectedId(node.id);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">HUMAN KNOWLEDGE MAP</p>
          <h1>人类知识地图</h1>
        </div>
        <div className="topbar-actions">
          <input
            aria-label="搜索知识点"
            placeholder="搜索：加法、线性代数、Transformer…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <label className="zoom-filter">
            <span>知识深度 {maxZoomLevel}</span>
            <input type="range" min="2" max="20" value={maxZoomLevel} onChange={(e) => setMaxZoomLevel(Number(e.target.value))} />
          </label>
        </div>
      </header>

      <section className="workspace">
        <div className="graph-wrap">
          <ReactFlow
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
            minZoom={0.12}
            maxZoom={2.8}
            nodesDraggable
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={28} size={1} />
            <MiniMap zoomable pannable />
            <Controls />
          </ReactFlow>
          <div className="map-hint">滚轮缩放 · 拖动画布 · 点击节点探索</div>
        </div>

        <aside className="detail-panel">
          {selected ? (
            <>
              <div className="detail-badges">
                <span>{selected.domain}</span>
                <span>{selected.educationLevel}</span>
                <span>Zoom {selected.zoomLevel}</span>
              </div>
              <h2>{selected.label}</h2>
              <p className="detail-description">{selected.description}</p>
              <dl>
                <div><dt>类型</dt><dd>{selected.type}</dd></div>
                <div><dt>难度</dt><dd>{selected.difficulty}/10</dd></div>
                <div><dt>学习状态</dt><dd>{selected.learningStatus ?? '未学习'}</dd></div>
              </dl>
              <p className="detail-note">未来这里会展示前置知识、应用领域、来源、学习材料、掌握度以及 AI Teacher 推荐路径。</p>
            </>
          ) : (
            <p>点击任意知识点查看详情。</p>
          )}
        </aside>
      </section>
    </main>
  );
}
