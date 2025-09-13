import type { Node, Edge } from '@xyflow/react'; // Use type-only import
import type { ControlsState, CustomNodeData, NodeMetrics, SimulationResult, SimulationState } from '@/types';

const SIMULATION_RULES = {
  trafficImpact: {
    responsiveness: (traffic: number) => traffic / 10, // Penalty: higher traffic reduces responsiveness
    cost: (traffic: number) => traffic * 0.01,
  },
};

export class SimulationService {

  calculateNodeMetrics(
    node: Node<CustomNodeData>,
    incomingTraffic: number,
    controls: ControlsState
  ): NodeMetrics {
    const { data } = node;
    const { baseMetrics } = data; // Removed scalingFactors

    let responsiveness = baseMetrics.responsiveness;
    let cost = baseMetrics.cost;
    let reliability = baseMetrics.reliability;

    // Apply traffic impact
    responsiveness -= SIMULATION_RULES.trafficImpact.responsiveness(incomingTraffic);
    cost += SIMULATION_RULES.trafficImpact.cost(incomingTraffic);

    return {
      responsiveness: Math.max(0, Math.min(100, responsiveness)),
      traffic: incomingTraffic,
      cost: parseFloat(cost.toFixed(2)), // Round cost to 2 decimal places
      reliability: Math.max(0, Math.min(100, reliability)),
    };
  }

  async calculateMetrics(
    nodes: Node<CustomNodeData>[],
    edges: Edge[],
    controls: ControlsState
  ): Promise<SimulationResult> {
    let totalResponsiveness = 0;
    let totalCost = 0;
    let totalReliability = 0;
    const nodeMetricsMap = new Map<string, NodeMetrics>();

    // For simplicity, assume all nodes receive the same traffic for now
    const incomingTraffic = controls.traffic;

    for (const node of nodes) {
      const metrics = this.calculateNodeMetrics(node, incomingTraffic, controls);
      nodeMetricsMap.set(node.id, metrics);
      totalResponsiveness += metrics.responsiveness;
      totalCost += metrics.cost;
      totalReliability += metrics.reliability;
    }

    const averageResponseTime = nodes.length > 0 ? 100 - (totalResponsiveness / nodes.length) : 0;
    const overallReliability = nodes.length > 0 ? totalReliability / nodes.length : 0;

    return {
      nodeMetrics: nodeMetricsMap,
      systemMetrics: {
        totalCost: totalCost,
        averageResponseTime: averageResponseTime,
        reliability: overallReliability,
      },
      recommendations: [], // To be implemented later
      controls: controls,
    };
  }

  animateDataFlow(edges: Edge[]): void {
    console.log('Animating data flow for edges:', edges);
    // TODO: Implement actual data flow animation
  }

  getCalculationDetails(
    node: Node<CustomNodeData>,
    incomingTraffic: number,
    controls: ControlsState
  ): { formulas: string[]; breakdown: string[] } {
    const currentNode = node; // Explicitly use the parameter
    const currentIncomingTraffic = incomingTraffic; // Explicitly use the parameter
    const currentControls = controls; // Explicitly use the parameter

    const { data } = currentNode;
    const { baseMetrics } = data; // Removed scalingFactors

    const formulas: string[] = [];
    const breakdown: string[] = [];

    // Initial values
    let responsiveness = baseMetrics.responsiveness;
    let cost = baseMetrics.cost;
    let reliability = baseMetrics.reliability;

    breakdown.push(`Initial Responsiveness: ${baseMetrics.responsiveness}`);
    breakdown.push(`Initial Cost: ${baseMetrics.cost}`);
    breakdown.push(`Initial Reliability: ${baseMetrics.reliability}`);

    // Traffic Impact
    const trafficResponsivenessImpact = SIMULATION_RULES.trafficImpact.responsiveness(currentIncomingTraffic);
    const trafficCostImpact = SIMULATION_RULES.trafficImpact.cost(currentIncomingTraffic);
    responsiveness -= trafficResponsivenessImpact;
    cost += trafficCostImpact;
    formulas.push(`Responsiveness = Responsiveness - (Traffic / 10)`);
    formulas.push(`Cost = Cost + (Traffic * 0.01)`);
    breakdown.push(`Traffic Impact (Traffic: ${currentIncomingTraffic}):`);
    breakdown.push(`  Responsiveness -= ${trafficResponsivenessImpact.toFixed(2)} (now: ${responsiveness.toFixed(2)})`);
    breakdown.push(`  Cost += ${trafficCostImpact.toFixed(2)} (now: ${cost.toFixed(2)})`);

    // Final clamping
    responsiveness = Math.max(0, Math.min(100, responsiveness));
    reliability = Math.max(0, Math.min(100, reliability));
    cost = Math.max(0, cost);
    breakdown.push(`Final Responsiveness (clamped): ${responsiveness.toFixed(2)}`);
    breakdown.push(`Final Cost (clamped): ${cost.toFixed(2)}`);
    breakdown.push(`Final Reliability (clamped): ${reliability.toFixed(2)}`);

    return { formulas, breakdown };
  }
}
