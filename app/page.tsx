'use client';

import { useMemo, useState } from 'react';
import { Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, type Node } from '@xyflow/react';
import { demoEdges, demoNodes, knowledgeById } from '../src/data/demo-graph';
import { findPath } from '../src/lib/path';
import type { KnowledgeNodeData } from '../src/types/knowledge';

const statusLabel: Record<string,string> = { mastered:'已掌握', learning:'正在学习', weak:'薄弱', review:'待复习', unlearned:'未学习' };

export default function Home() {
  const [nodes, , onNodesChange] = useNodesState(demoNodes);
  const [edges, , onEdgesChange] = useEdgesState(demoEdges);
  const [selectedId, setSelectedId] = useState<string | null>('natural-numbers');
  const [query, setQuery] = useState('');
  const [maxZoomLevel, setMaxZoomLevel] = useState(20);
  const [startId, setStartId] = useState('natural-numbers');
  const [goalId, setGoalId] = useState('transformer');
  const path = useMemo(() => findPath(startId, goalId, edges), [startId, goalId, edges]);
  const pathIds = useMemo(() => new Set(path), [path]);

  const filteredNodes = useMemo(() => {
    const text = query.trim().toLowerCase();
    return nodes.filter((node) => {
      const data = node.data as KnowledgeNodeData;
      return data.zoomLevel <= maxZoomLevel && (!text || data.label.toLowerCase().includes(text) || data.description.toLowerCase().includes(text));
    }).map((node) => ({ ...node, style: { ...node.style, opacity: path.length && !pathIds.has(node.id) ? .28 : 1, borderColor: pathIds.has(node.id) ? '#38bdf8' : 'rgba(255,255,255,.16)' } }));
  }, [nodes, query, maxZoomLevel, path, pathIds]);

  const visibleIds = useMemo(() => new Set(filteredNodes.map((node) => node.id)), [filteredNodes]);
  const filteredEdges = edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)).map((edge) => ({ ...edge, style: { ...edge.style, opacity: pathIds.has(edge.source) && pathIds.has(edge.target) ? 1 : .18, stroke: pathIds.has(edge.source) && pathIds.has(edge.target) ? '#38bdf8' : '#64748b' } }));
  const selected = selectedId ? knowledgeById[selectedId] : undefined;
  const masteredCount = nodes.filter((n) => n.data.learningStatus === 'mastered').length;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">HUMAN KNOWLEDGE MAP</p><h1>人类知识地图</h1></div>
        <div className="topbar-actions">
          <input aria-label="搜索知识点" placeholder="搜索：加法、线性代数、Transformer…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <label className="zoom-filter"><span>知识深度 {maxZoomLevel}</span><input type="range" min="2" max="20" value={maxZoomLevel} onChange={(e) => setMaxZoomLevel(Number(e.target.value))} /></label>
        </div>
      </header>

      <div className="pathbar">
        <span>学习路径</span>
        <select value={startId} onChange={(e) => setStartId(e.target.value)}>{nodes.map((n) => <option key={n.id} value={n.id}>{n.data.label}</option>)}</select>
        <span>→</span>
        <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>{nodes.map((n) => <option key={n.id} value={n.id}>{n.data.label}</option>)}</select>
        <strong>{path.length ? `${path.length - 1} 个学习阶段` : '暂无可达路径'}</strong>
        <span className="progress-chip">已掌握 {masteredCount}/{nodes.length}</span>
      </div>

      <section className="workspace">
        <div className="graph-wrap">
          <ReactFlow nodes={filteredNodes} edges={filteredEdges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={(_: React.MouseEvent, node: Node) => setSelectedId(node.id)} fitView minZoom={0.12} maxZoom={2.8} nodesDraggable proOptions={{ hideAttribution: true }}>
            <Background gap={28} size={1} /><MiniMap zoomable pannable /><Controls />
          </ReactFlow>
          <div className="map-hint">滚轮缩放 · 拖动画布 · 点击节点探索 · 路径会自动高亮</div>
        </div>

        <aside className="detail-panel">
          {selected ? <>
            <div className="detail-badges"><span>{selected.domain}</span><span>{selected.educationLevel}</span><span>Zoom {selected.zoomLevel}</span></div>
            <h2>{selected.label}</h2><p className="detail-description">{selected.description}</p>
            <dl><div><dt>类型</dt><dd>{selected.type}</dd></div><div><dt>难度</dt><dd>{selected.difficulty}/10</dd></div><div><dt>学习状态</dt><dd>{statusLabel[selected.learningStatus ?? 'unlearned']}</dd></div></dl>
            <p className="detail-note">这个节点属于个人知识覆盖层的一部分。后续会接入掌握度、遗忘曲线、来源、学习材料和 AI Teacher 推荐。</p>
          </> : <p>点击任意知识点查看详情。</p>}
        </aside>
      </section>
    </main>
  );
}
