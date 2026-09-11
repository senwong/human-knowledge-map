'use client';

import { useMemo, useState } from 'react';
import { mathFoundationNodes, mathFoundationEdges } from '../../src/data/math-foundation';
import { calculateGraphMetrics } from '../../src/lib/graph-metrics';
import { starterDatasets, summarizeDatasets } from '../../src/lib/dataset-registry';

export default function AdminPage() {
  const [tab, setTab] = useState<'overview'|'review'|'datasets'|'publish'>('overview');
  const metrics = useMemo(() => calculateGraphMetrics(
    mathFoundationNodes.map((node, index) => ({ id: node.id, position: { x: index * 10, y: 0 }, data: { ...node, description: node.description ?? '', zoomLevel: Math.min(20, node.difficulty * 2), learningStatus: 'unlearned' } } as any)),
    mathFoundationEdges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target, label: edge.relation })) as any
  ), []);
  const datasets = useMemo(() => summarizeDatasets(starterDatasets), []);

  return <main style={{minHeight:'100vh',background:'#07111f',color:'#e5edf7',padding:28,fontFamily:'system-ui'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center',marginBottom:24}}>
      <div><div style={{fontSize:12,letterSpacing:2,color:'#67e8f9'}}>HUMAN KNOWLEDGE MAP · ADMIN</div><h1 style={{margin:'8px 0'}}>Knowledge Operations</h1><p style={{color:'#94a3b8',margin:0}}>审核、数据集、发布和图谱质量的运营入口。</p></div>
      <a href="/" style={{color:'#7dd3fc'}}>返回知识地图</a>
    </header>
    <nav style={{display:'flex',gap:8,marginBottom:24}}>{(['overview','review','datasets','publish'] as const).map((item)=><button key={item} onClick={()=>setTab(item)} style={{padding:'9px 14px',borderRadius:10,border:'1px solid #23354d',background:tab===item?'#12314a':'#0b1728',color:'#e5edf7'}}>{item}</button>)}</nav>
    {tab==='overview' && <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14}}>{[
      ['Canonical nodes',metrics.nodes],['Relations',metrics.edges],['Domains',metrics.domains],['Isolated',metrics.isolatedNodes],['Datasets',datasets.datasets],['Published datasets',datasets.published]
    ].map(([label,value])=><article key={String(label)} style={{padding:18,border:'1px solid #1f334a',borderRadius:16,background:'#0b1728'}}><div style={{color:'#94a3b8',fontSize:13}}>{label}</div><strong style={{fontSize:28}}>{value}</strong></article>)}</section>}
    {tab==='review' && <Panel title="Review queue" text="AI、课程标准和批量导入产生的 change-set 会在这里统一审核。v5.0 API 已提供基础队列接口，本页作为运营入口。" />}
    {tab==='datasets' && <section style={{display:'grid',gap:10}}>{starterDatasets.map((d)=><article key={d.id} style={{padding:16,border:'1px solid #1f334a',borderRadius:14,background:'#0b1728'}}><strong>{d.name}</strong><div style={{color:'#94a3b8',marginTop:5}}>{d.domain} · {d.language} · {d.status}</div></article>)}</section>}
    {tab==='publish' && <Panel title="Publish pipeline" text="只有 approved change-set 才能进入 canonical graph。发布动作会产生 version snapshot 和 append-only graph events。" />}
  </main>;
}

function Panel({title,text}:{title:string;text:string}) { return <section style={{padding:22,border:'1px solid #1f334a',borderRadius:16,background:'#0b1728'}}><h2>{title}</h2><p style={{color:'#a8b5c7',lineHeight:1.7}}>{text}</p></section>; }
