import type { Edge, Node } from '@xyflow/react';
import type { KnowledgeNodeData } from '../types/knowledge';

const concepts: Array<[string, string, string, string, number, string]> = [
  ['natural-numbers','自然数','小学数学','primary',1,'理解计数、大小与顺序，是后续数学学习的起点。'],
  ['addition','加法','小学数学','primary',2,'把数量合并起来的基本运算。'],
  ['multiplication','乘法','小学数学','primary',3,'重复加法的抽象，也是比例、代数和组合结构的基础。'],
  ['fractions','分数','小学数学','primary',4,'表示整体的一部分，并引出比例与有理数。'],
  ['equations','方程','代数','middle-school',6,'用符号描述未知量之间的约束关系。'],
  ['functions','函数','代数','middle-school',7,'描述输入与输出之间的映射关系。'],
  ['vectors','向量','数学','high-school',9,'带有方向和大小的对象，是线性代数的重要语言。'],
  ['matrices','矩阵','数学','undergraduate',11,'表达线性变换以及多维数据关系的核心工具。'],
  ['linear-algebra','线性代数','数学','undergraduate',12,'研究向量空间、线性变换、矩阵与特征结构。'],
  ['probability','概率论','数学','undergraduate',12,'研究随机事件、分布与不确定性。'],
  ['neural-networks','神经网络','人工智能','undergraduate',14,'通过参数化函数逼近复杂模式。'],
  ['attention','Attention','人工智能','graduate',17,'让模型根据上下文动态分配信息权重。'],
  ['transformer','Transformer','人工智能','research',20,'以自注意力为核心的序列建模架构。']
];

export const demoNodes: Node<KnowledgeNodeData>[] = concepts.map(([id,label,domain,educationLevel,zoomLevel,description], index) => ({
  id,
  position: { x: index * 250, y: Math.sin(index / 2) * 140 + (index % 2) * 120 },
  data: {
    label,
    description,
    domain,
    educationLevel,
    zoomLevel,
    difficulty: Math.min(10, Math.max(1, Math.ceil(zoomLevel / 2))),
    type: id === 'transformer' ? 'research_topic' : 'concept',
    learningStatus: index < 3 ? 'mastered' : index === 3 ? 'learning' : 'unlearned'
  },
  style: {
    width: 180,
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,.16)',
    padding: 14,
    fontWeight: 700,
    background: 'rgba(15,23,42,.9)',
    color: 'white',
    boxShadow: '0 12px 34px rgba(0,0,0,.24)'
  }
}));

export const demoEdges: Edge[] = concepts.slice(0, -1).map((item, index) => ({
  id: `e-${item[0]}-${concepts[index + 1][0]}`,
  source: item[0],
  target: concepts[index + 1][0],
  label: 'prerequisite',
  animated: index >= 9,
  style: { strokeWidth: 2 }
}));

export const knowledgeById = Object.fromEntries(demoNodes.map((node) => [node.id, node.data]));
