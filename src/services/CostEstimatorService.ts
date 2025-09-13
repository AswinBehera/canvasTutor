import type { Node } from '@xyflow/react';
import type { ControlsState, CustomNodeData } from '@/types';

interface CostBreakdown {
  [nodeId: string]: number;
}

interface CostEstimationResult {
  totalCost: number;
  breakdown: CostBreakdown;
}

export class CostEstimatorService {
  estimateCost(
    nodes: Node<CustomNodeData>[],
    controls: ControlsState
  ): CostEstimationResult {
    let totalCost = 0;
    const breakdown: CostBreakdown = {};

    for (const node of nodes) {
      const { data } = node;
      const { baseMetrics } = data;

      let nodeCost = baseMetrics.cost; // Base cost from component definition

      // Simple cost scaling based on traffic (example: 0.01 per unit of traffic per node)
      nodeCost += controls.traffic * 0.01;

      breakdown[data.label] = parseFloat(nodeCost.toFixed(2)); // Use node label for breakdown
      totalCost += nodeCost;
    }

    return {
      totalCost: parseFloat(totalCost.toFixed(2)),
      breakdown,
    };
  }
}
