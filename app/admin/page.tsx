'use client';

import { useEffect, useMemo, useState } from 'react';
import { mathFoundationNodes, mathFoundationEdges } from '../../src/data/math-foundation';
import { calculateGraphMetrics } from '../../src/lib/graph-metrics';
import { starterDatasets, summarizeDatasets } from '../../src/lib/dataset-registry';

type AdminSummary = {
  canonical: { nodes: number; edges: number };
  curriculumScaffold: { nodes: number; edges: number; note: string };
  operations: { reviewQueue: number; approvedWaitingPublish: number; rejected: number; datasetFailures: number; importingDatasets: number; publishedDatasets: number; reviewApprovalRate: number };
  health: { status: 'healthy'|'attention'; blockers: string[] };
  generatedAt: string;
};

export default function AdminPage() {
  const [tab, setTab] = useState<'overview'|'review'|'datasets'|'publish'>('overview');
  const [remote, setRemote] = useState<AdminSummary | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { fetch('/api/admin').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setRemote).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load admin summary')); }, []);

  const metrics = useMemo(() => calculateGraphMetrics(
    mathFoundationNodes.map((node, index) => ({ id: node.id, position: { x: index * 10, y: 0 }, data: { ...node, description: node.description ?? '', zoomLevel: Math.min(20, node.difficulty * 2), learningStatus: 'unlearned' } } as any)),
    mathFoundationEdges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target, label: edge.relation })) as any
  ), []);
  const datasets = useMemo(() => summarizeDatasets(starterDatasets), []);
  const canonicalNodes = remote?.canonical.nodes ?? metrics.nodes;
  const canonicalEdges = remote?.canonical.edges ?? metrics.edges;

  return <main style={{minHeight:'100vh',background:'#07111f',color:'#e5edf7',padding:28,fontFamily:'system-ui'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center',marginBottom:24}}>
      <div><div style={{fontSize:12,letterSpacing:2,color:'#67e8f9'}}>HUMAN KNOWLEDGE MAP · ADMIN · v6.2</div><h1 style={{margin:'8px 0'}}>Knowledge Operations</h1><p style={{color:'#94a3b8',margin:0}}>审核、数据集、发布和图谱质量的运营入口。</p></div>
      <div style={{display:'flex',gap:14}}><a href="/lab" style={{color:'#7dd3fc'}}>Large Graph Lab</a><a href="/" style={{color:'#7dd3fc'}}>返回知识地图</a></div>
    </header>
    <div style={{padding:'10px 14px',borderRadius:12,marginBottom:18,background:remote?.health.status==='attention'?'#3b1d24':'#0d2a27',border:'1px solid #29485b',color:'#cbd5e1'}}>
      {error ? `Admin API: ${error}` : remote ? `系统状态：${remote.health.status} · ${remote.health.blockers.length ? remote.health.blockers.join('；') : '暂无运营阻塞'}` : '正在加载运营状态…'}
    </div>
    <nav style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>{(['overview','review','datasets','publish'] as const).map((item)=><button key={item} onClick={()=>setTab(item)} style={{padding:'9px 14px',borderRadius:10,border:'1px solid #23354d',background:tab===item?'#12314a':'#0b1728',color:'#e5edf7'}}>{item}</button>)}</nav>
    {tab==='overview' && <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14}}>{[
      ['Canonical nodes',canonicalNodes],['Relations',canonicalEdges],['Domains',metrics.domains],['Isolated',metrics.isolatedNodes],['Scaffold nodes',remote?.curriculumScaffold.nodes ?? '—'],['Review queue',remote?.operations.reviewQueue ?? '—'],['Datasets',datasets.datasets],['Published datasets',remote?.operations.publishedDatasets ?? datasets.published]
    ].map(([label,value])=><article key={String(label)} style={{padding:18,border:'1px solid #1f334a',borderRadius:16,background:'#0b1728'}}><div style={{color:'#94a3b8',fontSize:13}}>{label}</div><strong style={{fontSize:28}}>{value}</strong></article>)}</section>}
    {tab==='review' && <Panel title="Review queue" text={`待审核 change-set：${remote?.operations.reviewQueue ?? '—'}；已批准待发布：${remote?.operations.approvedWaitingPublish ?? '—'}。AI、课程标准和批量导入都必须经过同一审核流。`} />}
    {tab==='datasets' && <section style={{display:'grid',gap:10}}>{starterDatasets.map((d)=><article key={d.id} style={{padding:16,border:'1px solid #1f334a',borderRadius:14,background:'#0b1728'}}><strong>{d.name}</strong><div style={{color:'#94a3b8',marginTop:5}}>{d.domain} · {d.language} · {d.status}</div></article>)}</section>}
    {tab==='publish' && <Panel title="Publish pipeline" text="approved change-set → canonical merge → release manifest → PostgreSQL → graph event。每次数据发布都有独立 data version 和可比较的 release manifest。" />}
    {remote?.curriculumScaffold && <p style={{color:'#64748b',fontSize:12,marginTop:24}}>Curriculum scaffold: {remote.curriculumScaffold.note}</p>}
  </main>;
}

function Panel({title,text}:{title:string;text:string}) { return <section style={{padding:22,border:'1px solid #1f334a',borderRadius:16,background:'#0b1728'}}><h2>{title}</h2><p style={{color:'#a8b5c7',lineHeight:1.7}}>{text}</p></section>; }
