'use client';

import { useEffect, useMemo, useState } from 'react';
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from '@xyflow/react';
import type { CanonicalKnowledgeEdge, CanonicalKnowledgeNode } from '../src/data/math-foundation';
import { knowledgeSources, sourceConfidence } from '../src/data/sources';
import { useLearnerState, type LearningStatus } from '../src/hooks/use-learner-state';
import type { KnowledgeNodeData } from '../src/types/knowledge';

const statusLabel: Record<LearningStatus, string> = {
  mastered: '已掌握',
  learning: '正在学习',
  weak: '薄弱',
  review: '待复习',
  unlearned: '未学习'
};

const statusBorder: Record<LearningStatus, string> = {
  mastered: '#34d399',
  learning: '#38bdf8',
  weak: '#fb7185',
  review: '#fbbf24',
  unlearned: 'rgba(255,255,255,.16)'
};

type GraphResponse = {
  nodes: CanonicalKnowledgeNode[];
  edges: CanonicalKnowledgeEdge[];
  total: number;
  source?: 'repository' | 'canonical-seed';
};

function edgeId(edge: CanonicalKnowledgeEdge) {
  return `${edge.source}:${edge.relation}:${edge.target}`;
}

function mergeGraph(current: GraphResponse, incoming: GraphResponse): GraphResponse {
  const nodes = new Map(current.nodes.map((node) => [node.id, node]));
  const edges = new Map(current.edges.map((edge) => [edgeId(edge), edge]));
  incoming.nodes.forEach((node) => nodes.set(node.id, node));
  incoming.edges.forEach((edge) => edges.set(edgeId(edge), edge));
  return {
    nodes: [...nodes.values()],
    edges: [...edges.values()],
    total: Math.max(current.total, incoming.total, nodes.size),
    source: incoming.source ?? current.source
  };
}

function layoutNodes(nodes: CanonicalKnowledgeNode[], learner: ReturnType<typeof useLearnerState>['state'], selectedId: string | null, query: string): Node<KnowledgeNodeData>[] {
  const domainIndex = new Map<string, number>();
  const domainCounts = new Map<string, number>();
  const text = query.trim().toLowerCase();

  return nodes.map((node) => {
    if (!domainIndex.has(node.domain)) domainIndex.set(node.domain, domainIndex.size);
    const domain = domainIndex.get(node.domain) ?? 0;
    const localIndex = domainCounts.get(node.domain) ?? 0;
    domainCounts.set(node.domain, localIndex + 1);
    const status = learner[node.id]?.status ?? 'unlearned';
    const matches = !text || node.label.toLowerCase().includes(text) || node.domain.toLowerCase().includes(text) || node.educationLevel.toLowerCase().includes(text);
    const selected = node.id === selectedId;

    return {
      id: node.id,
      position: {
        x: domain * 430 + (localIndex % 3) * 150,
        y: Math.floor(localIndex / 3) * 125 + node.difficulty * 10
      },
      data: {
        label: node.label,
        description: node.description ?? '',
        domain: node.domain,
        educationLevel: node.educationLevel,
        difficulty: node.difficulty,
        zoomLevel: Math.min(20, Math.max(2, node.difficulty * 2)),
        type: node.type,
        aliases: node.aliases,
        learningStatus: status
      },
      style: {
        width: 140,
        borderRadius: 16,
        border: `1px solid ${selected ? '#a78bfa' : statusBorder[status]}`,
        padding: 10,
        fontWeight: 700,
        fontSize: 12,
        background: selected ? 'rgba(88,28,135,.92)' : 'rgba(15,23,42,.94)',
        color: 'white',
        opacity: matches ? 1 : 0.2,
        boxShadow: selected ? '0 0 0 2px rgba(167,139,250,.2),0 16px 42px rgba(0,0,0,.3)' : '0 10px 28px rgba(0,0,0,.2)'
      }
    };
  });
}

export default function Home() {
  const [graph, setGraph] = useState<GraphResponse>({ nodes: [], edges: [], total: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { state: learner, setRecord, progress } = useLearnerState({});

  useEffect(() => {
    setLoading(true);
    fetch('/api/graph?limit=1000')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<GraphResponse>;
      })
      .then((value) => {
        setGraph(value);
        setSelectedId(value.nodes[0]?.id ?? null);
        setError('');
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : '知识图谱加载失败'))
      .finally(() => setLoading(false));
  }, []);

  async function expandNode(id: string, depth = 1) {
    setSelectedId(id);
    try {
      const response = await fetch(`/api/graph?node=${encodeURIComponent(id)}&depth=${depth}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const value = await response.json() as GraphResponse;
      setGraph((current) => mergeGraph(current, value));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '相关知识加载失败');
    }
  }

  const nodes = useMemo(() => layoutNodes(graph.nodes, learner, selectedId, query), [graph.nodes, learner, selectedId, query]);
  const visible = useMemo(() => new Set(nodes.map((node) => node.id)), [nodes]);
  const edges: Edge[] = useMemo(() => graph.edges
    .filter((edge) => visible.has(edge.source) && visible.has(edge.target))
    .map((edge) => ({
      id: edgeId(edge),
      source: edge.source,
      target: edge.target,
      label: edge.relation,
      style: { stroke: '#64748b', strokeWidth: 1.6, opacity: 0.55 }
    })), [graph.edges, visible]);

  const selected = selectedId ? graph.nodes.find((node) => node.id === selectedId) : undefined;
  const selectedRecord = selectedId ? learner[selectedId] : undefined;
  const selectedSources = selectedId ? (knowledgeSources[selectedId] ?? []) : [];
  const related = useMemo(() => {
    if (!selectedId) return [];
    const ids = new Set<string>();
    graph.edges.forEach((edge) => {
      if (edge.source === selectedId) ids.add(edge.target);
      if (edge.target === selectedId) ids.add(edge.source);
    });
    return [...ids].map((id) => graph.nodes.find((node) => node.id === id)).filter((node): node is CanonicalKnowledgeNode => Boolean(node));
  }, [graph.edges, graph.nodes, selectedId]);

  const updateStatus = (status: LearningStatus) => {
    if (!selectedId) return;
    const fallbackMastery = status === 'mastered' ? 90 : status === 'learning' ? 50 : status === 'weak' ? 30 : status === 'review' ? 65 : 0;
    setRecord(selectedId, {
      status,
      mastery: selectedRecord?.mastery ?? fallbackMastery,
      lastReviewedAt: status === 'mastered' || status === 'review' ? new Date().toISOString() : selectedRecord?.lastReviewedAt
    });
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">HUMAN KNOWLEDGE MAP · v7.2</p><h1>人类知识地图</h1></div>
        <div className="topbar-actions">
          <input aria-label="搜索知识点" placeholder="搜索知识、领域或学习阶段…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <a className="ghost-button" href="/admin">知识运营</a>
        </div>
      </header>

      <div className="pathbar">
        <span>全局知识视图</span>
        <strong>{graph.nodes.length} / {graph.total || graph.nodes.length} 个已加载知识点</strong>
        <span>{graph.edges.length} 条关系</span>
        <span className="progress-chip">个人掌握度 {progress}%</span>
        <span className="progress-chip">数据源：{graph.source === 'canonical-seed' ? 'Canonical Seed（数据库暂为空）' : 'Knowledge Repository'}</span>
        {loading && <span>正在加载…</span>}
        {error && <span style={{ color: '#fb7185' }}>{error}</span>}
      </div>

      <section className="workspace">
        <div className="graph-wrap">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={(_, node) => void expandNode(node.id, 1)}
            onNodeDoubleClick={(_, node) => void expandNode(node.id, 2)}
            fitView
            minZoom={0.06}
            maxZoom={2.8}
            nodesDraggable
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={28} size={1} /><MiniMap zoomable pannable /><Controls />
          </ReactFlow>
          <div className="map-hint">单击展开直接相关知识 · 双击展开 2 层邻域 · 搜索只高亮，不会把其它知识从地图删除</div>
          <div className="map-stats"><span>{graph.nodes.length} 节点</span><span>{graph.edges.length} 关系</span><span>持续增量加载</span></div>
        </div>

        <aside className="detail-panel">
          {selected ? <>
            <div className="detail-badges"><span>{selected.domain}</span><span>{selected.educationLevel}</span><span>难度 {selected.difficulty}</span></div>
            <h2>{selected.label}</h2>
            <p className="detail-description">{selected.description || `${selected.label} 是当前知识图谱中的 ${selected.type} 节点。`}</p>
            <dl><div><dt>类型</dt><dd>{selected.type}</dd></div><div><dt>难度</dt><dd>{selected.difficulty}</dd></div><div><dt>来源可信度</dt><dd>{selectedId ? sourceConfidence(selectedId) : 0}%</dd></div></dl>

            <section className="panel-section"><h3>相关知识</h3>{related.length ? related.map((node) => <button className="recommendation" key={node.id} onClick={() => void expandNode(node.id, 1)}><strong>{node.label}</strong><span>{node.domain} · {node.educationLevel}</span></button>) : <p className="muted">单击当前节点后会加载它的直接相关知识。</p>}</section>

            <section className="panel-section"><h3>我的学习状态</h3><div className="status-grid">{(Object.keys(statusLabel) as LearningStatus[]).map((status) => <button key={status} className={selectedRecord?.status === status ? 'active' : ''} onClick={() => updateStatus(status)}>{statusLabel[status]}</button>)}</div><label className="mastery-slider"><span>掌握度 {selectedRecord?.mastery ?? 0}%</span><input type="range" min="0" max="100" value={selectedRecord?.mastery ?? 0} onChange={(e) => selectedId && setRecord(selectedId, { mastery: Number(e.target.value), status: Number(e.target.value) >= 80 ? 'mastered' : Number(e.target.value) > 0 ? 'learning' : 'unlearned' })} /></label></section>

            <section className="panel-section"><h3>知识来源</h3>{selectedSources.length ? selectedSources.map((source) => <div className="source-card" key={source.id}><strong>{source.title}</strong><span>{source.kind} · 可信度 {Math.round(source.confidence * 100)}%</span></div>) : <p className="muted">暂无已审核来源，后续需要补充。</p>}</section>
          </> : <p>点击任意知识点查看详情并展开相关知识。</p>}
        </aside>
      </section>
    </main>
  );
}
