export interface CanonicalKnowledgeNode {
  id: string;
  label: string;
  domain: string;
  educationLevel: string;
  type: 'concept' | 'skill' | 'theorem' | 'method' | 'research_topic';
  difficulty: number;
  aliases?: string[];
}

export interface CanonicalKnowledgeEdge {
  source: string;
  target: string;
  relation: 'prerequisite' | 'contains' | 'related_to' | 'used_by' | 'generalizes';
}

const rows: Array<[string,string,string,string,CanonicalKnowledgeNode['type'],number]> = [
  ['counting','计数','小学数学','grade-1','skill',1],['natural-numbers','自然数','小学数学','grade-1','concept',1],['number-order','数的大小与顺序','小学数学','grade-1','concept',1],['addition','加法','小学数学','grade-1','skill',1],['subtraction','减法','小学数学','grade-1','skill',1],['place-value','位值制','小学数学','grade-1','concept',2],['multiplication','乘法','小学数学','grade-2','skill',2],['division','除法','小学数学','grade-2','skill',2],['fractions','分数','小学数学','grade-3','concept',3],['decimals','小数','小学数学','grade-3','concept',3],['ratio','比','小学数学','grade-5','concept',4],['percentage','百分数','小学数学','grade-5','concept',4],['negative-numbers','负数','中学数学','middle-school','concept',4],['variables','变量','中学数学','middle-school','concept',4],['expressions','代数式','中学数学','middle-school','concept',5],['linear-equations','一元一次方程','中学数学','middle-school','concept',5],['coordinate-plane','平面直角坐标系','中学数学','middle-school','concept',5],['functions','函数','中学数学','middle-school','concept',6],['linear-functions','一次函数','中学数学','middle-school','concept',6],['quadratic-functions','二次函数','中学数学','middle-school','concept',6],['systems-equations','方程组','中学数学','middle-school','concept',6],['powers','乘方','中学数学','middle-school','concept',5],['roots','平方根','中学数学','middle-school','concept',6],['polynomials','多项式','中学数学','middle-school','concept',6],['factoring','因式分解','中学数学','middle-school','skill',6],['geometry-basics','平面几何基础','中学数学','middle-school','concept',5],['triangles','三角形','中学数学','middle-school','concept',5],['pythagorean','勾股定理','中学数学','middle-school','theorem',6],['similarity','相似','中学数学','middle-school','concept',6],['trigonometry','三角函数','高中数学','high-school','concept',7],['sequences','数列','高中数学','high-school','concept',7],['exponential-functions','指数函数','高中数学','high-school','concept',7],['logarithms','对数','高中数学','high-school','concept',7],['probability-basic','概率基础','高中数学','high-school','concept',7],['statistics-basic','统计基础','高中数学','high-school','concept',7],['vectors','向量','高中数学','high-school','concept',7],['limits','极限','大学数学','undergraduate','concept',8],['derivatives','导数','大学数学','undergraduate','concept',8],['integrals','积分','大学数学','undergraduate','concept',8],['differential-equations','微分方程','大学数学','undergraduate','concept',9],['matrices','矩阵','大学数学','undergraduate','concept',8],['linear-transformations','线性变换','大学数学','undergraduate','concept',8],['vector-spaces','向量空间','大学数学','undergraduate','concept',9],['eigenvalues','特征值与特征向量','大学数学','undergraduate','concept',9],['linear-algebra','线性代数','大学数学','undergraduate','concept',9],['probability','概率论','大学数学','undergraduate','concept',9],['random-variables','随机变量','大学数学','undergraduate','concept',9],['distributions','概率分布','大学数学','undergraduate','concept',9],['expectation','期望与方差','大学数学','undergraduate','concept',9],['bayes-theorem','贝叶斯定理','大学数学','undergraduate','theorem',9],['optimization','优化','大学数学','undergraduate','concept',9],['gradient-descent','梯度下降','机器学习数学','undergraduate','method',9],['information-theory','信息论','机器学习数学','undergraduate','concept',10],['entropy','熵','机器学习数学','undergraduate','concept',10],['cross-entropy','交叉熵','机器学习数学','undergraduate','concept',10],['neural-networks','神经网络','人工智能','undergraduate','concept',10],['attention','Attention','人工智能','graduate','method',11],['transformer','Transformer','人工智能','graduate','concept',11],['flash-attention','FlashAttention','人工智能','research','research_topic',12]
];

export const mathFoundationNodes: CanonicalKnowledgeNode[] = rows.map(([id,label,domain,educationLevel,type,difficulty]) => ({ id,label,domain,educationLevel,type,difficulty }));

const chainGroups = [
  ['counting','natural-numbers','number-order','addition','multiplication','division','fractions','ratio','percentage'],
  ['natural-numbers','negative-numbers','variables','expressions','linear-equations','functions','linear-functions','quadratic-functions'],
  ['powers','roots','polynomials','factoring'],
  ['geometry-basics','triangles','pythagorean','similarity','trigonometry'],
  ['functions','sequences','exponential-functions','logarithms','limits','derivatives','integrals','differential-equations'],
  ['coordinate-plane','vectors','matrices','linear-transformations','vector-spaces','eigenvalues','linear-algebra'],
  ['fractions','probability-basic','probability','random-variables','distributions','expectation','bayes-theorem'],
  ['derivatives','optimization','gradient-descent','neural-networks','attention','transformer','flash-attention'],
  ['probability','information-theory','entropy','cross-entropy','neural-networks']
];

export const mathFoundationEdges: CanonicalKnowledgeEdge[] = chainGroups.flatMap((group) => group.slice(0,-1).map((source,index) => ({ source, target: group[index + 1], relation: 'prerequisite' as const })));
