import type { CanonicalKnowledgeEdge, CanonicalKnowledgeNode } from './math-foundation';

const strands = [
  { key:'number', label:'数与运算', levels:['grade-1','grade-2','grade-3','grade-4','grade-5','grade-6'], skills:['认识与表示','比较与排序','口算','笔算','估算','应用题'] },
  { key:'algebra', label:'代数与规律', levels:['grade-3','grade-4','grade-5','grade-6','middle-school','high-school'], skills:['模式发现','符号表示','等式','方程','函数关系','变化率'] },
  { key:'geometry', label:'图形与几何', levels:['grade-1','grade-2','grade-3','grade-4','grade-5','grade-6','middle-school'], skills:['图形识别','位置方向','长度角度','周长面积','体积','变换','证明'] },
  { key:'measure', label:'度量', levels:['grade-1','grade-2','grade-3','grade-4','grade-5','grade-6'], skills:['长度','质量','时间','面积','体积','单位换算'] },
  { key:'data', label:'数据与概率', levels:['grade-1','grade-2','grade-3','grade-4','grade-5','grade-6','middle-school','high-school'], skills:['分类','表格','统计图','平均数','可能性','概率','抽样'] }
] as const;

export const expandedMathNodes: CanonicalKnowledgeNode[] = strands.flatMap((strand, strandIndex) =>
  strand.levels.flatMap((level, levelIndex) =>
    strand.skills.map((skill, skillIndex) => ({
      id: `math:${strand.key}:${level}:${skillIndex + 1}`,
      label: `${strand.label} · ${skill}`,
      description: `${level} 阶段的“${skill}”学习目标脚手架，用于课程标准映射、教材条目导入和后续专家细化。`,
      domain: level.startsWith('grade-') ? '小学数学' : level === 'middle-school' ? '中学数学' : '高中数学',
      educationLevel: level,
      type: (skill.includes('口算') || skill.includes('笔算') || skill.includes('证明')) ? 'skill' : 'concept',
      difficulty: Math.min(10, 1 + levelIndex + Math.floor(strandIndex / 2)),
      aliases: [`${skill}-${level}`]
    } as CanonicalKnowledgeNode))
  )
);

const grouped = new Map<string, CanonicalKnowledgeNode[]>();
for (const node of expandedMathNodes) {
  const key = node.id.split(':').slice(0,3).join(':');
  const list = grouped.get(key) ?? [];
  list.push(node);
  grouped.set(key, list);
}

export const expandedMathEdges: CanonicalKnowledgeEdge[] = [...grouped.values()].flatMap((nodes) =>
  nodes.slice(0,-1).map((node,index) => ({
    id: `${node.id}:prerequisite:${nodes[index + 1].id}`,
    source: node.id,
    target: nodes[index + 1].id,
    relation: 'prerequisite' as const
  }))
);

export const expandedMathDatasetSummary = {
  nodes: expandedMathNodes.length,
  edges: expandedMathEdges.length,
  note: 'This is a curriculum scaffold, not authoritative canonical knowledge. Each generated item still requires source mapping and review before publication.'
};
