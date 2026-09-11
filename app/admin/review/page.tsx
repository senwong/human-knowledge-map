'use client';

import { useEffect, useMemo, useState } from 'react';

type ReviewItem = {
  changeSet: { id: string; author: string; reason: string; mutations: Array<{ type: string }> };
  status: string;
  reviewer?: string;
  notes?: string;
};

export default function ReviewWorkspace() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => { fetch('/api/review').then((r) => r.json()).then((data) => { setItems(data.items ?? []); setSelectedId(data.items?.[0]?.changeSet?.id ?? ''); }); }, []);
  const selected = useMemo(() => items.find((item) => item.changeSet.id === selectedId), [items, selectedId]);

  return <main style={{minHeight:'100vh',background:'#07111f',color:'#e5edf7',padding:28,fontFamily:'system-ui'}}>
    <header style={{marginBottom:20}}><a href="/admin" style={{color:'#7dd3fc'}}>← Admin</a><h1>Review Workspace</h1><p style={{color:'#94a3b8'}}>逐个检查 change-set、记录审核意见，并在发布前确认变更规模。</p></header>
    <div style={{display:'grid',gridTemplateColumns:'320px minmax(0,1fr)',gap:18}}>
      <aside style={{display:'grid',gap:8,alignContent:'start'}}>{items.length ? items.map((item)=><button key={item.changeSet.id} onClick={()=>setSelectedId(item.changeSet.id)} style={{textAlign:'left',padding:14,borderRadius:12,border:'1px solid #23354d',background:selectedId===item.changeSet.id?'#12314a':'#0b1728',color:'#e5edf7'}}><strong>{item.changeSet.reason}</strong><div style={{color:'#94a3b8',fontSize:12,marginTop:4}}>{item.status} · {item.changeSet.mutations.length} mutations</div></button>) : <p style={{color:'#94a3b8'}}>Review queue 为空。</p>}</aside>
      <section style={{padding:20,border:'1px solid #1f334a',borderRadius:16,background:'#0b1728'}}>{selected ? <><div style={{color:'#67e8f9'}}>{selected.changeSet.id}</div><h2>{selected.changeSet.reason}</h2><p style={{color:'#94a3b8'}}>author: {selected.changeSet.author} · status: {selected.status}</p><div style={{display:'grid',gap:8,margin:'18px 0'}}>{selected.changeSet.mutations.map((mutation,index)=><div key={index} style={{padding:10,borderRadius:10,background:'#101f33'}}>{mutation.type}</div>)}</div><textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="审核意见…" style={{width:'100%',minHeight:120,background:'#07111f',color:'#e5edf7',border:'1px solid #23354d',borderRadius:10,padding:12}} /><p style={{color:'#64748b',fontSize:12}}>本页先提供可编辑审核工作区；状态写回和权限控制由发布 API 统一处理。</p></> : <p>选择一个 change-set。</p>}</section>
    </div>
  </main>;
}
