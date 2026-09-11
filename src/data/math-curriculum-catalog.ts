export interface MathCurriculumConcept {
  id: string;
  label: string;
  stage: 'primary' | 'middle-school' | 'high-school' | 'undergraduate';
  strand: string;
  prerequisites: string[];
}

const primary = [
  ['counting','计数','数与运算',[]],['place-value','位值制','数与运算',['counting']],['addition','加法','数与运算',['counting']],['subtraction','减法','数与运算',['addition']],['multiplication','乘法','数与运算',['addition']],['division','除法','数与运算',['multiplication']],['fractions','分数','数与运算',['division']],['decimals','小数','数与运算',['place-value','fractions']],['percentages','百分数','数与运算',['fractions','decimals']],['ratio','比','数与运算',['division','fractions']],['length','长度','测量',[]],['area','面积','测量',['multiplication','length']],['volume','体积','测量',['area']],['angles','角','几何',[]],['triangles','三角形','几何',['angles']],['quadrilaterals','四边形','几何',['angles']],['symmetry','对称','几何',[]],['coordinates-basic','基础坐标','几何',['counting']],['tables','表格','统计',[]],['bar-charts','条形图','统计',['tables']],['average-basic','平均数','统计',['division']],['probability-basic','初步概率','统计',['fractions']]
] as const;

const secondary = [
  ['negative-numbers','负数','代数',['subtraction']],['powers','乘方','代数',['multiplication']],['roots','开方','代数',['powers']],['algebraic-expressions','代数式','代数',['negative-numbers']],['linear-equations','一元一次方程','代数',['algebraic-expressions']],['systems-linear','线性方程组','代数',['linear-equations']],['inequalities','不等式','代数',['linear-equations']],['quadratic-equations','二次方程','代数',['powers','linear-equations']],['functions','函数','函数',['linear-equations']],['linear-functions','一次函数','函数',['functions']],['quadratic-functions','二次函数','函数',['quadratic-equations','functions']],['sequences','数列','代数',['algebraic-expressions']],['pythagorean','勾股定理','几何',['triangles','powers']],['similarity','相似','几何',['ratio','triangles']],['circle','圆','几何',['angles']],['trigonometry','三角函数','几何',['similarity','functions']],['descriptive-statistics','描述统计','统计',['average-basic']],['probability','概率','统计',['probability-basic']],['combinatorics-basic','初步组合','统计',['multiplication']]
] as const;

const advanced = [
  ['limits','极限','微积分',['functions']],['derivatives','导数','微积分',['limits']],['integrals','积分','微积分',['derivatives']],['series','级数','微积分',['sequences','limits']],['vectors','向量','线性代数',['coordinates-basic']],['matrices','矩阵','线性代数',['vectors','systems-linear']],['linear-transformations','线性变换','线性代数',['matrices']],['eigenvalues','特征值与特征向量','线性代数',['linear-transformations']],['multivariable-calculus','多元微积分','微积分',['integrals','vectors']],['differential-equations','微分方程','微积分',['derivatives']],['random-variables','随机变量','概率统计',['probability','functions']],['distributions','概率分布','概率统计',['random-variables']],['expectation','期望','概率统计',['random-variables','integrals']],['variance','方差','概率统计',['expectation']],['conditional-probability','条件概率','概率统计',['probability']],['bayes-theorem','贝叶斯定理','概率统计',['conditional-probability']],['hypothesis-testing','假设检验','概率统计',['distributions']],['optimization','优化','应用数学',['derivatives','linear-algebra']],['linear-algebra','线性代数','线性代数',['matrices','vectors']]
] as const;

function mapRows(rows: readonly (readonly [string,string,string,readonly string[]])[], stage: MathCurriculumConcept['stage']): MathCurriculumConcept[] {
  return rows.map(([id,label,strand,prerequisites]) => ({ id, label, strand, stage, prerequisites: [...prerequisites] }));
}

export const mathCurriculumCatalog: MathCurriculumConcept[] = [
  ...mapRows(primary, 'primary'),
  ...mapRows(secondary, 'middle-school'),
  ...mapRows(advanced, 'undergraduate')
];

export function conceptsByStage(stage: MathCurriculumConcept['stage']) {
  return mathCurriculumCatalog.filter((concept) => concept.stage === stage);
}
