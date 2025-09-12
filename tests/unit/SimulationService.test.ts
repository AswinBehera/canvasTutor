import { SimulationService } from '../../src/services/SimulationService';
import { describe, it, expect, beforeEach } from 'vitest';
import type { Node } from '@xyflow/react';
import type { CustomNodeData, ControlsState } from '@/types';

describe('SimulationService', () => {
  let service: SimulationService;

  beforeEach(() => {
    service = new SimulationService();
  });

  // Mock Node for testing
  const mockNode: Node<CustomNodeData> = {
    id: 'node1',
    type: 'custom',
    position: { x: 0, y: 0 },
    data: {
      label: 'Test Node',
      description: 'A node for testing',
      category: 'backend',
      techOptions: ['Managed', 'DIY'],
      baseMetrics: { responsiveness: 80, cost: 30, reliability: 90 },
      scalingFactors: { traffic: 0.1, instances: 0.7 },
    },
  };

  // Mock ControlsState for testing
  const defaultControls: ControlsState = {
    traffic: 100,
    instances: 1,
    cache: 'off',
    vendor: 'managed',
  };

  describe('calculateNodeMetrics', () => {
    it('should calculate metrics correctly with default controls', () => {
      const metrics = service.calculateNodeMetrics(mockNode, 100, defaultControls);
      expect(metrics.responsiveness).toBeCloseTo(88, 10);
      expect(metrics.cost).toBeCloseTo(71.4, 10);
      expect(metrics.reliability).toBeCloseTo(100, 10);
    });

    it('should apply traffic impact correctly', () => {
      const controls = { ...defaultControls, traffic: 500 };
      const metrics = service.calculateNodeMetrics(mockNode, 500, controls);
      expect(metrics.responsiveness).toBeCloseTo(44, 10);
      expect(metrics.cost).toBeCloseTo(77, 10);
    });

    it('should apply instance scaling correctly', () => {
      const controls = { ...defaultControls, instances: 5 };
      const metrics = service.calculateNodeMetrics(mockNode, 100, controls);
      expect(metrics.responsiveness).toBeCloseTo(100, 10); // Clamped to 100
      expect(metrics.cost).toBeCloseTo(183.4, 10);
    });

    it('should apply cache effects correctly', () => {
      const controls = { ...defaultControls, cache: 'small' };
      const metrics = service.calculateNodeMetrics(mockNode, 100, controls);
      expect(metrics.responsiveness).toBeCloseTo(100, 10); // Clamped to 100
      expect(metrics.cost).toBeCloseTo(78.54, 10);
    });

    it('should apply vendor multipliers correctly', () => {
      const controls = { ...defaultControls, vendor: 'diy' };
      const metrics = service.calculateNodeMetrics(mockNode, 100, controls);
      expect(metrics.responsiveness).toBeCloseTo(72, 10);
      expect(metrics.cost).toBeCloseTo(35.7, 10);
      expect(metrics.reliability).toBeCloseTo(72, 10);
    });
  });

  describe('calculateMetrics (system-level)', () => {
    it('should calculate system-level metrics correctly for multiple nodes', async () => {
      const mockNodes: Node<CustomNodeData>[] = [
        { ...mockNode, id: 'node1' },
        { ...mockNode, id: 'node2', data: { ...mockNode.data, baseMetrics: { responsiveness: 70, cost: 40, reliability: 85 } } },
      ];
      const metrics = await service.calculateMetrics(mockNodes, [], defaultControls);

      expect(metrics.systemMetrics.totalCost).toBeCloseTo(156.8, 10);
      expect(metrics.systemMetrics.averageResponseTime).toBeCloseTo(17.5, 10);
      expect(metrics.systemMetrics.reliability).toBeCloseTo(100, 10);
      expect(metrics.nodeMetrics.size).toBe(2);
      expect(metrics.nodeMetrics.get('node1')).toBeDefined();
      expect(metrics.nodeMetrics.get('node2')).toBeDefined();
    });

    it('should handle empty nodes array', async () => {
      const metrics = await service.calculateMetrics([], [], defaultControls);
      expect(metrics.systemMetrics.totalCost).toBe(0);
      expect(metrics.systemMetrics.averageResponseTime).toBe(0);
      expect(metrics.systemMetrics.reliability).toBe(0);
      expect(metrics.nodeMetrics.size).toBe(0);
    });
  });
});
