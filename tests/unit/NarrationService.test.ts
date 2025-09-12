import { NarrationService } from '../../src/services/NarrationService';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { SimulationState } from '@/types';

describe('NarrationService', () => {
  let service: NarrationService;

  beforeEach(() => {
    service = new NarrationService();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate narration based on simulation state changes', async () => {
    const previousState: SimulationState = {
      nodeMetrics: new Map(),
      systemMetrics: {
        totalCost: 100,
        averageResponseTime: 50,
        reliability: 90,
      },
      recommendations: [],
    };

    const newState: SimulationState = {
      nodeMetrics: new Map(),
      systemMetrics: {
        totalCost: 120,
        averageResponseTime: 60,
        reliability: 85,
      },
      recommendations: [],
    };

    const changedControl = 'traffic';
    const mockLlmOutput = 'The system cost increased due to higher traffic. Consider optimizing data transfer.';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: mockLlmOutput } }] }),
    });

    const narration = await service.generateNarration(previousState, newState, changedControl);

    expect(narration).toBe(mockLlmOutput);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer '), // Expect any string starting with Bearer
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'CanvasTutor',
        }),
        body: expect.stringContaining('You are an AI assistant providing plain-English explanations'), // Check for part of the prompt
      }),
    );
  });

  it('should return a fallback message if LLM narration fails', async () => {
    const previousState: SimulationState = {
      nodeMetrics: new Map(),
      systemMetrics: {
        totalCost: 100,
        averageResponseTime: 50,
        reliability: 90,
      },
      recommendations: [],
    };

    const newState: SimulationState = {
      nodeMetrics: new Map(),
      systemMetrics: {
        totalCost: 120,
        averageResponseTime: 60,
        reliability: 85,
      },
      recommendations: [],
    };

    const changedControl = 'traffic';

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: { message: 'Internal Server Error' } }),
    });

    const narration = await service.generateNarration(previousState, newState, changedControl);

    expect(narration).toBe('The simulation has been updated. I am unable to provide a detailed explanation at this moment.');
  });
});
