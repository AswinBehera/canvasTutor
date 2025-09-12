import type { Node, Edge } from '@xyflow/react'; // Use type-only import
import type { ControlsState, CustomNodeData, NodeMetrics, SimulationRules, SimulationResult, SimulationState } from '@/types';

const SIMULATION_RULES: SimulationRules = {
  trafficImpact: {
    responsiveness: (traffic) => traffic / 10, // Penalty: higher traffic reduces responsiveness
    cost: (traffic) => traffic * 0.01,
  },
  instanceScaling: {
    responsiveness: (instances) => instances * 10,
    cost: (instances) => instances * 20,
  },
  cacheEffects: {
    off: { responsiveness: 1.0, cost: 1.0 },
    small: { responsiveness: 1.2, cost: 1.1 },
    large: { responsiveness: 1.5, cost: 1.3 },
  },
  vendorMultipliers: {
    managed: { responsiveness: 1.1, cost: 1.4, reliability: 1.2 },
    diy: { responsiveness: 0.9, cost: 0.7, reliability: 0.8 },
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

    // Apply instance scaling
    responsiveness += SIMULATION_RULES.instanceScaling.responsiveness(controls.instances);
    cost += SIMULATION_RULES.instanceScaling.cost(controls.instances);

    // Apply cache effects
    const cacheMultiplier = SIMULATION_RULES.cacheEffects[controls.cache];
    responsiveness *= cacheMultiplier.responsiveness;
    cost *= cacheMultiplier.cost;

    // Apply vendor multipliers
    const vendorMultiplier = SIMULATION_RULES.vendorMultipliers[controls.vendor];
    responsiveness *= vendorMultiplier.responsiveness;
    cost *= vendorMultiplier.cost;
    reliability *= vendorMultiplier.reliability;

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

    // Instance Scaling
    const instanceResponsivenessMultiplier = SIMULATION_RULES.instanceScaling.responsiveness(currentControls.instances);
    const instanceCostMultiplier = SIMULATION_RULES.instanceScaling.cost(currentControls.instances);
    responsiveness += instanceResponsivenessMultiplier;
    cost += instanceCostMultiplier;
    formulas.push(`Responsiveness = Responsiveness + (Instances * 10)`);
    formulas.push(`Cost = Cost + (Instances * 20)`);
    breakdown.push(`Instance Scaling (Instances: ${currentControls.instances}):`);
    breakdown.push(`  Responsiveness += ${instanceResponsivenessMultiplier.toFixed(2)} (now: ${responsiveness.toFixed(2)})`);
    breakdown.push(`  Cost += ${instanceCostMultiplier.toFixed(2)} (now: ${cost.toFixed(2)})`);

    // Cache Effects
    const cacheMultiplier = SIMULATION_RULES.cacheEffects[currentControls.cache];
    responsiveness *= cacheMultiplier.responsiveness;
    cost *= cacheMultiplier.cost;
    formulas.push(`Responsiveness = Responsiveness * Cache_Multiplier`);
    formulas.push(`Cost = Cost * Cache_Multiplier`);
    breakdown.push(`Cache Effects (Cache: ${currentControls.cache}):`);
    breakdown.push(`  Responsiveness *= ${cacheMultiplier.responsiveness.toFixed(2)} (now: ${responsiveness.toFixed(2)})`);
    breakdown.push(`  Cost *= ${cacheMultiplier.cost.toFixed(2)} (now: ${cost.toFixed(2)})`);

    // Vendor Multipliers
    const vendorMultiplier = SIMULATION_RULES.vendorMultipliers[currentControls.vendor];
    responsiveness *= vendorMultiplier.responsiveness;
    cost *= vendorMultiplier.cost;
    reliability *= vendorMultiplier.reliability;
    formulas.push(`Responsiveness = Responsiveness * Vendor_Responsiveness_Multiplier`);
    formulas.push(`Cost = Cost * Vendor_Cost_Multiplier`);
    formulas.push(`Reliability = Reliability * Vendor_Reliability_Multiplier`);
    breakdown.push(`Vendor Multipliers (Vendor: ${currentControls.vendor}):`);
    breakdown.push(`  Responsiveness *= ${vendorMultiplier.responsiveness.toFixed(2)} (now: ${responsiveness.toFixed(2)})`);
    breakdown.push(`  Cost *= ${vendorMultiplier.cost.toFixed(2)} (now: ${cost.toFixed(2)})`);
    breakdown.push(`  Reliability *= ${vendorMultiplier.reliability.toFixed(2)} (now: ${reliability.toFixed(2)})`);

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
