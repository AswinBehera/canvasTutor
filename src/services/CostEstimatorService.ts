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

      // Apply instance scaling
      nodeCost *= controls.instances;

      // Apply cache effects (assuming cache adds to cost)
      if (controls.cache === 'small') {
        nodeCost *= 1.1; // 10% increase for small cache
      } else if (controls.cache === 'large') {
        nodeCost *= 1.3; // 30% increase for large cache
      }

      // Apply vendor multipliers
      if (controls.vendor === 'managed') {
        nodeCost *= 1.4; // Managed services are more expensive
      } else if (controls.vendor === 'diy') {
        nodeCost *= 0.7; // DIY is cheaper
      }

      breakdown[data.label] = parseFloat(nodeCost.toFixed(2)); // Use node label for breakdown
      totalCost += nodeCost;
    }

    return {
      totalCost: parseFloat(totalCost.toFixed(2)),
      breakdown,
    };
  }
}
