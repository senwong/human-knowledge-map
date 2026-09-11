import { NextResponse } from 'next/server';
import { mathFoundationEdges, mathFoundationNodes } from '../../../src/data/math-foundation';
import { expandedMathDatasetSummary } from '../../../src/data/math-curriculum-expanded';
import { starterDatasets } from '../../../src/lib/dataset-registry';
import { calculateKnowledgeOpsMetrics, operationalHealth } from '../../../src/lib/operations-metrics';

export async function GET() {
  const ops = calculateKnowledgeOpsMetrics([], starterDatasets);
  return NextResponse.json({
    canonical: { nodes: mathFoundationNodes.length, edges: mathFoundationEdges.length },
    curriculumScaffold: expandedMathDatasetSummary,
    datasets: starterDatasets,
    operations: ops,
    health: operationalHealth(ops),
    generatedAt: new Date().toISOString()
  });
}
