'use client';

import { useMemo, useState } from 'react';
import { Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, type Node } from '@xyflow/react';
import { demoEdges, demoNodes, knowledgeById } from '../src/data/demo-graph';
import { knowledgeSources, sourceConfidence } from '../src/data/sources';
import { useLearnerState, type LearnerState, type LearningStatus } from '../src/hooks/use-learner-state';
import { summarizeDomains, graphStats } from '../src/lib/domain';
import { downloadGraph } from '../src/lib/graph-io';
import { findPath } from '../src/lib/path';
import { recommendNext } from '../src/lib/recommend';
import { getSemanticZoomBand, semanticZoomLabel, visibleForSemanticZoom } from '../src/lib/semantic-zoom';
import { validateGraph } from '../src/lib/validate-graph';
import type { KnowledgeNodeData } from '../src/types/knowledge';

const statusLabel: Record<LearningStatus,string> = { mastered:'已掌握', learning:'正在学习', weak:'薄弱', review:'待复习', unlearned:'未学习' };
const statusBorder: Record<LearningStatus,string> = { mastered:'#34d399', learning:'#38bdf8', weak:'#fb7185', review:'#fbbf24', unlearned:'rgba(255,255,255,.16)' };

const initialLearnerState: LearnerState = Object.fromEntries(demoNodes.map((node) => {
  const status = (node.data.learningStatus ?? 'unlearned') as LearningStatus;
  const mastery = status === 'mastered' ? 90 : status === 'learning' ? 55 : status === 'weak' ? 35 : status === 'review' ? 65 : 0;
  return [node.id, { status, mastery }];
}));

export default function Home() {
  const [nodes, , onNodesChange] = useNodesState(demoNodes);
  const [edges, , onEdgesChange] = useEdgesState(demoEdges);
  const [selectedId, setSelectedId] = useState<string | null>('natural-numbers');
  const [query, setQuery] = useState('');
  const [maxZoomLevel, setMaxZoomLevel] = useState(20);
  const [viewportZoom, setViewportZoom] = useState(1);
  const [startId, setStartId] = useState('natural-numbers');
  const [goalId, setGoalId] = useState('transformer');
  const { state: learner, setRecord, progress } = useLearnerState(initialLearnerState);

  const band = getSemanticZoomBand(viewportZoom);
  const path = useMemo(() => findPath(startId, goalId, edges), [startId, goalId, edges]);
  const pathIds = useMemo(() => new Set(path), [path]);
  const stats = useMemo(() => graphStats(nodes, edges), [nodes, edges]);
  const domains = useMemo(() => summarizeDomains(nodes), [nodes]);
  const issues = useMemo(() => validateGraph(nodes, edges), [nodes, edges]);
  const recommendations = useMemo(() => recommendNext(nodes, edges, learner), [nodes, edges, learner]);

  const filteredNodes = useMemo(() => {
    const text = query.trim().toLowerCase();
    return nodes.filter((node) => {
      const data = node.data as KnowledgeNodeData;
      const matchesText = !text || data.label.toLowerCase().includes(text) || data.description.toLowerCase().includes(text) || data.domain.toLowerCase().includes(text);
      return data.zoomLevel <= maxZoomLevel && matchesText && visibleForSemanticZoom(node, band);
    }).map((node) => {
      const status = learner[node.id]?.status ?? (node.data.learningStatus as LearningStatus | undefined) ?? 'unlearned';
      return { ...node, style: { ...node.style, opacity: path.length && !pathIds.has(node.id) ? .24 : 1, borderColor: pathIds.has(node.id) ? '#a78bfa' : statusBorder[status], boxShadow: pathIds.has(node.id) ? '0 0 0 2px rgba(167,139,250,.18),0 16px 42px rgba(0,0,0,.3)' : node.style?.boxShadow } };
    });
  }, [nodes, query, maxZoomLevel, path, pathIds, learner, band]);

  const visibleIds = useMemo(() => new Set(filteredNodes.map((node) => node.id)), [filteredNodes]);
  const filteredEdges = edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)).map((edge) => {
    const active = pathIds.has(edge.source) && pathIds.has(edge.target);
    return { ...edge, style: { ...edge.style, opacity: active ? 1 : .16, stroke: active ? '#a78bfa' : '#64748b' } };
  });

  const selected = selectedId ? knowledgeById[selectedId] : undefined;
  const selectedRecord = selectedId ? learner[selectedId] : undefined;
  const selectedSources = selectedId ? (knowledgeSources[selectedId] ?? []) : [];

  const updateStatus = (status: LearningStatus) => {
    if (!selectedId) return;
    const fallbackMastery = status === 'mastered' ? 90 : status === 'learning' ? 50 : status === 'weak' ? 30 : status === 'review' ? 65 : 0;
    setRecord(selectedId, { status, mastery: selectedRecord?.mastery ?? fallbackMastery, lastReviewedAt: status === 'mastered' || status === 'review' ? new Date().toISOString() : selectedRecord?.lastReviewedAt });
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">HUMAN KNOWLEDGE MAP · v2.2</p><h1>人类知识地图</h1></div>
        <div className="topbar-actions">
          <input aria-label="搜索知识点" placeholder="搜索知识、领域或研究方向…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="ghost-button" onClick={() => downloadGraph(nodes, edges)}>导出图谱</button>
          <label className="zoom-filter"><span>最大知识深度 {maxZoomLevel}</span><input type="range" min="2" max="20" value={maxZoomLevel} onChange={(e) => setMaxZoomLevel(Number(e.target.value))} /></label>
        </div>
      </header>

      <div className="pathbar">
        <span>学习路径</span>
        <select value={startId} onChange={(e) => setStartId(e.target.value)}>{nodes.map((n) => <option key={n.id} value={n.id}>{n.data.label}</option>)}</select>
        <span>→</span>
        <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>{nodes.map((n) => <option key={n.id} value={n.id}>{n.data.label}</option>)}</select>
        <strong>{path.length ? `${path.length - 1} 个学习阶段` : '暂无可达路径'}</strong>
        <span className="progress-chip">个人掌握度 {progress}%</span>
        <span className="progress-chip">视图：{semanticZoomLabel[band]}</span>
      </div>

      <section className="workspace">
        <div className="graph-wrap">
          <ReactFlow nodes={filteredNodes} edges={filteredEdges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onMoveEnd={(_, viewport) => setViewportZoom(viewport.zoom)} onNodeClick={(_: React.MouseEvent, node: Node) => setSelectedId(node.id)} fitView minZoom={0.12} maxZoom={2.8} nodesDraggable proOptions={{ hideAttribution: true }}>
            <Background gap={28} size={1} /><MiniMap zoomable pannable /><Controls />
          </ReactFlow>
          <div className="map-hint">滚轮改变语义层级 · 拖动画布 · 点击知识点 · 紫色为当前学习路径</div>
          <div className="map-stats"><span>{stats.nodes} 节点</span><span>{stats.edges} 关系</span><span>{stats.domains} 领域</span><span>{issues.length ? `${issues.length} 数据问题` : '图谱校验通过'}</span></div>
        </div>

        <aside className="detail-panel">
          {selected ? <>
            <div className="detail-badges"><span>{selected.domain}</span><span>{selected.educationLevel}</span><span>Zoom {selected.zoomLevel}</span></div>
            <h2>{selected.label}</h2><p className="detail-description">{selected.description}</p>
            <dl><div><dt>类型</dt><dd>{selected.type}</dd></div><div><dt>难度</dt><dd>{selected.difficulty}/10</dd></div><div><dt>来源可信度</dt><dd>{selectedId ? sourceConfidence(selectedId) : 0}%</dd></div></dl>

            <section className="panel-section"><h3>我的学习状态</h3><div className="status-grid">{(Object.keys(statusLabel) as LearningStatus[]).map((status) => <button key={status} className={selectedRecord?.status === status ? 'active' : ''} onClick={() => updateStatus(status)}>{statusLabel[status]}</button>)}</div><label className="mastery-slider"><span>掌握度 {selectedRecord?.mastery ?? 0}%</span><input type="range" min="0" max="100" value={selectedRecord?.mastery ?? 0} onChange={(e) => selectedId && setRecord(selectedId, { mastery: Number(e.target.value), status: Number(e.target.value) >= 80 ? 'mastered' : Number(e.target.value) > 0 ? 'learning' : 'unlearned' })} /></label></section>

            <section className="panel-section"><h3>知识来源</h3>{selectedSources.length ? selectedSources.map((source) => <div className="source-card" key={source.id}><strong>{source.title}</strong><span>{source.kind} · 可信度 {Math.round(source.confidence * 100)}%</span></div>) : <p className="muted">暂无已审核来源，后续需要补充。</p>}</section>

            <section className="panel-section"><h3>AI Teacher 推荐</h3>{recommendations.length ? recommendations.slice(0,3).map((item) => <button className="recommendation" key={item.nodeId} onClick={() => setSelectedId(item.nodeId)}><strong>{knowledgeById[item.nodeId]?.label ?? item.nodeId}</strong><span>{item.reason}</span></button>) : <p className="muted">继续标记学习状态后会生成个性化推荐。</p>}</section>

            <section className="panel-section"><h3>领域概览</h3><div className="domain-list">{domains.slice(0,4).map((domain) => <div key={domain.domain}><span>{domain.domain}</span><strong>{domain.masteredCount}/{domain.nodeCount}</strong></div>)}</div></section>
          </> : <p>点击任意知识点查看详情。</p>}
        </aside>
      </section>
    </main>
  );
}
