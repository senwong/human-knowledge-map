'use client';

import { useState } from 'react';

export default function GeneratePage() {
  const [topic, setTopic] = useState('小学数学：分数');
  const [depth, setDepth] = useState(4);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true); setResult('');
    try {
      const response = await fetch('/api/expand', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ topic, depth }) });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) { setResult(String(error)); } finally { setLoading(false); }
  }

  return <main style={{minHeight:'100vh',background:'#07111f',color:'#e5edf7',padding:28,fontFamily:'system-ui'}}>
    <a href="/admin" style={{color:'#7dd3fc'}}>← Admin</a><h1>Controlled Generation</h1><p style={{color:'#94a3b8'}}>AI 输出只作为 proposal；生成后仍需经过 import preview、去重、来源补充和人工审核。</p>
    <section style={{maxWidth:900,padding:20,border:'1px solid #1f334a',borderRadius:16,background:'#0b1728'}}>
      <label style={{display:'grid',gap:6,marginBottom:14}}>Topic<input value={topic} onChange={(e)=>setTopic(e.target.value)} style={{padding:12,borderRadius:10,border:'1px solid #23354d',background:'#07111f',color:'#fff'}} /></label>
      <label style={{display:'grid',gap:6,marginBottom:14}}>Depth {depth}<input type="range" min="1" max="8" value={depth} onChange={(e)=>setDepth(Number(e.target.value))} /></label>
      <button onClick={generate} disabled={loading} style={{padding:'10px 16px',borderRadius:10,border:'1px solid #24506b',background:'#12314a',color:'#fff'}}>{loading?'Generating…':'Generate proposal'}</button>
      <pre style={{whiteSpace:'pre-wrap',marginTop:18,padding:16,borderRadius:12,background:'#06101c',color:'#b8c7da',maxHeight:520,overflow:'auto'}}>{result || '生成结果会显示在这里。'}</pre>
    </section>
  </main>;
}
