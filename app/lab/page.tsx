'use client';

import { useEffect, useMemo, useState } from 'react';
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from '@xyflow/react';
import type { CanonicalKnowledgeEdge, CanonicalKnowledgeNode } from '../../src/data/math-foundation';

interface GraphResponse { nodes: CanonicalKnowledgeNode[]; edges: CanonicalKnowledgeEdge[]; total: number; }

function layoutNodes(nodes: CanonicalKnowledgeNode[]): Node[] {
  const domainIndex = new Map<string, number>();
  return nodes.map((node, index) => {
    if (!domainIndex.has(node.domain)) domainIndex.set(node.domain, domainIndex.size);
    const domain = domainIndex.get(node.domain) ?? 0;
    return {
      id: node.id,
      data: { label: node.label, ...node },
      position: { x: domain * 520 + (index % 5) * 150, y: Math.floor(index / 5) * 120 },
      style: { width: 140, fontSize: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,.15)', background: '#0f172a', color: 'white' }
    };
  });
}

export default function LargeGraphLab() {
  const [graph, setGraph] = useState<GraphResponse>({ nodes: [], edges: [], total: 0 });
  const [limit, setLimit] = useState(60);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ node: CanonicalKnowledgeNode; score: number }>>([]);
  const [selectedId, setSelectedId] = useState<string>();

  useEffect(() => {
    fetch(`/api/graph?limit=${limit}`).then((res) => res.json()).then(setGraph);
  }, [limit]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (!query.trim()) return setResults([]);
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`).then((res) => res.json()).then((value) => setResults(value.results ?? []));
    }, 180);
    return () => window.clearTimeout(handle);
  }, [query]);

  const nodes = useMemo(() => layoutNodes(graph.nodes), [graph.nodes]);
  const visible = useMemo(() => new Set(nodes.map((node) => node.id)), [nodes]);
  const edges: Edge[] = useMemo(() => graph.edges.filter((edge) => visible.has(edge.source) && visible.has(edge.target)).map((edge, index) => ({ id: `${edge.source}-${edge.target}-${index}`, source: edge.source, target: edge.target, label: edge.relation })), [graph.edges, visible]);

  async function loadNeighborhood(id: string) {
    const value = await fetch(`/api/graph?node=${encodeURIComponent(id)}&depth=2`).then((res) => res.json()) as GraphResponse;
    setGraph(value);
    setSelectedId(id);
  }

  return <main style={{ height: '100vh', display: 'grid', gridTemplateRows: '86px 1fr', background: '#050816', color: 'white' }}>
    <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
      <div><strong>Large Graph Lab · v4.2</strong><div style={{ color: '#94a3b8', fontSize: 12 }}>服务端分页 + 邻域查询 + 搜索 + 渐进加载</div></div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索知识点" style={{ marginLeft: 'auto', width: 280, padding: 10, borderRadius: 10, background: '#0f172a', color: 'white', border: '1px solid #334155' }} />
      <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={{ padding: 10, borderRadius: 10, background: '#0f172a', color: 'white' }}><option value={30}>30 nodes</option><option value={60}>60 nodes</option><option value={200}>200 nodes</option></select>
      <span style={{ color: '#7dd3fc' }}>{graph.nodes.length}/{graph.total}</span>
    </header>
    <section style={{ position: 'relative' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView minZoom={0.08} maxZoom={2.4} onNodeDoubleClick={(_, node) => loadNeighborhood(node.id)} onNodeClick={(_, node) => setSelectedId(node.id)} proOptions={{ hideAttribution: true }}><Background /><MiniMap /><Controls /></ReactFlow>
      {results.length > 0 && <div style={{ position: 'absolute', right: 20, top: 12, width: 300, background: 'rgba(15,23,42,.96)', border: '1px solid #334155', borderRadius: 14, padding: 8, zIndex: 10 }}>{results.map((result) => <button key={result.node.id} onClick={() => loadNeighborhood(result.node.id)} style={{ width: '100%', display: 'block', textAlign: 'left', padding: 10, background: 'transparent', color: 'white', border: 0, cursor: 'pointer' }}>{result.node.label}<span style={{ float: 'right', color: '#64748b' }}>{result.node.domain}</span></button>)}</div>}
      <div style={{ position: 'absolute', left: 18, bottom: 18, padding: '8px 12px', borderRadius: 999, background: 'rgba(15,23,42,.9)', color: '#94a3b8', fontSize: 12 }}>双击节点加载 2 层邻域 {selectedId ? `· 当前 ${selectedId}` : ''}</div>
    </section>
  </main>;
}
