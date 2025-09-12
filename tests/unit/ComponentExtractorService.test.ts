import { ComponentExtractorService } from '../../src/services/ComponentExtractorService';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ComponentExtractorService', () => {
  let service: ComponentExtractorService;

  beforeEach(() => {
    service = new ComponentExtractorService();
    // Mock fetch to control LLM responses
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should extract components from valid LLM JSON output', async () => {
    const mockLlmOutput = JSON.stringify([
      {
        id: 'test1',
        label: 'Test Component 1',
        description: 'Description 1',
        techOptions: ['TechA', 'TechB'],
        category: 'frontend',
        baseMetrics: { responsiveness: 90, cost: 10, reliability: 99 },
        scalingFactors: { traffic: 0.1, instances: 0.9 },
      },
      {
        id: 'test2',
        label: 'Test Component 2',
        description: 'Description 2',
        techOptions: ['TechC', 'TechD'],
        category: 'backend',
        baseMetrics: { responsiveness: 80, cost: 20, reliability: 90 },
        scalingFactors: { traffic: 0.2, instances: 0.8 },
      },
    ]);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: mockLlmOutput } }] }),
    });

    const components = await service.extractComponents('test input');

    expect(components).toHaveLength(2);
    expect(components[0].id).toBe('test1');
    expect(components[0].baseMetrics?.responsiveness).toBe(90);
    expect(components[1].category).toBe('backend');
  });

  it('should return dummy components if LLM output is invalid JSON', async () => {
    const invalidLlmOutput = 'this is not json';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: invalidLlmOutput } }] }),
    });

    const components = await service.extractComponents('test input');

    // Expect fallback to dummy components
    expect(components).toHaveLength(3);
    expect(components[0].id).toBe('1'); // Dummy component ID
  });

  it('should return dummy components if LLM response is not ok', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: { message: 'Bad Request' } }),
    });

    const components = await service.extractComponents('test input');

    // Expect fallback to dummy components
    expect(components).toHaveLength(3);
    expect(components[0].id).toBe('1'); // Dummy component ID
  });

  it('should return dummy components if LLM output is empty', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: '' } }] }),
    });

    const components = await service.extractComponents('test input');

    // Expect fallback to dummy components
    expect(components).toHaveLength(3);
    expect(components[0].id).toBe('1'); // Dummy component ID
  });

  it('should return dummy components if LLM output is missing content', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{}] }),
    });

    const components = await service.extractComponents('test input');

    // Expect fallback to dummy components
    expect(components).toHaveLength(3);
    expect(components[0].id).toBe('1'); // Dummy component ID
  });
});
