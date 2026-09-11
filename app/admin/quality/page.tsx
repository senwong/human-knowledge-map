import { canonicalMathNodes, canonicalMathProvenance } from '../../../src/data/math-canonical';
import { provenanceCoverage } from '../../../src/lib/provenance-coverage';

export default function QualityPage() {
  const coverage = provenanceCoverage(canonicalMathNodes, canonicalMathProvenance);
  const cards = [
    ['Canonical nodes', coverage.total],
    ['With sources', `${coverage.sourcedPercent}%`],
    ['Editorially reviewed', `${coverage.reviewedPercent}%`],
    ['Verified', `${coverage.verifiedPercent}%`]
  ];

  return <main style={{minHeight:'100vh',background:'#07111f',color:'#e5edf7',padding:28,fontFamily:'system-ui'}}>
    <header style={{marginBottom:22}}><a href="/admin" style={{color:'#7dd3fc'}}>← Admin</a><h1>Knowledge Quality</h1><p style={{color:'#94a3b8'}}>关注来源覆盖、编辑审核和缺失来源，而不仅仅是节点规模。</p></header>
    <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12,marginBottom:22}}>{cards.map(([label,value])=><article key={String(label)} style={{padding:18,border:'1px solid #1f334a',borderRadius:14,background:'#0b1728'}}><div style={{fontSize:13,color:'#94a3b8'}}>{label}</div><strong style={{fontSize:30}}>{value}</strong></article>)}</section>
    <section style={{padding:20,border:'1px solid #1f334a',borderRadius:16,background:'#0b1728'}}><h2>Missing provenance</h2><p style={{color:'#94a3b8'}}>这些节点仍需补充可靠来源或完成来源映射。</p><div style={{display:'flex',flexWrap:'wrap',gap:8}}>{coverage.missingSourceIds.length ? coverage.missingSourceIds.map((id)=><span key={id} style={{padding:'7px 10px',borderRadius:999,background:'#15263a',color:'#b8c7da',fontSize:12}}>{id}</span>) : <span>当前 seed 节点均已有来源记录。</span>}</div></section>
    <p style={{color:'#64748b',fontSize:12,marginTop:18}}>“reviewed” 表示项目内部编辑核对；“verified” 预留给更严格的外部来源验证流程。</p>
  </main>;
}
