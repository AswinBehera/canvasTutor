import type { SimulationState } from '@/types';

export class NarrationService {
  private narrationCache = new Map<string, string>();

  private getCacheKey(previousState: SimulationState, newState: SimulationState, changedControl: string): string {
    return `${JSON.stringify(previousState.systemMetrics)}-${JSON.stringify(newState.systemMetrics)}-${changedControl}`;
  }

  async generateNarration(
    previousState: SimulationState,
    newState: SimulationState,
    changedControl: string
  ): Promise<string> {
    const cacheKey = this.getCacheKey(previousState, newState, changedControl);
    if (this.narrationCache.has(cacheKey)) {
      return this.narrationCache.get(cacheKey)!;
    }

    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || 'YOUR_OPENROUTER_API_KEY';
    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const modelName = 'openai/gpt-oss-20b';

    const prompt = `You are an AI assistant providing plain-English explanations for system simulation changes.

Here's the previous state of the system:
Total Cost: ${previousState.systemMetrics.totalCost}
Average Response Time: ${previousState.systemMetrics.averageResponseTime}
Reliability: ${previousState.systemMetrics.reliability}

Here's the new state after changing the '${changedControl}' control:
Total Cost: ${newState.systemMetrics.totalCost}
Average Response Time: ${newState.systemMetrics.averageResponseTime}
Reliability: ${newState.systemMetrics.reliability}

Explain in detail what happened and why, using beginner-friendly language without technical jargon. Provide a detailed, practical, and cost-effective suggestion related to the change. Also, explain the trade-offs of your suggestion.

Example:
Changing the traffic from low to high made your system more expensive and a bit slower. This is because the increased traffic puts more load on your servers, which increases the cost and the response time. A good way to handle this is to add a caching layer. A caching layer is like a temporary storage for frequently accessed data. It can significantly improve the responsiveness of your system and reduce the load on your servers. However, it also adds complexity to your system and can increase the cost if not implemented correctly.`;

    try {
      const response = await fetch(openRouterUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'CanvasTutor',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenRouter API error for narration:', errorData);
        throw new Error(`OpenRouter API request failed with status ${response.status}: ${errorData.error.message || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const llmOutput = data.choices[0]?.message?.content;

      if (!llmOutput) {
        throw new Error('LLM response for narration was empty or in an unexpected format.');
      }

      const narration = llmOutput.trim();
      this.narrationCache.set(cacheKey, narration);
      return narration;

    } catch (error) {
      console.error('Error generating narration from LLM:', error);
      return 'The simulation has been updated. I am unable to provide a detailed explanation at this moment.';
    }
  }

  async generateDeepDiveNarration(
    simulationState: SimulationState,
    metric: string
  ): Promise<string> {
    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || 'YOUR_OPENROUTER_API_KEY';
    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const modelName = 'openai/gpt-oss-20b';

    const prompt = `You are an AI assistant providing a deep dive explanation for a specific system simulation metric.

Here's the current state of the system:
Total Cost: ${simulationState.systemMetrics.totalCost}
Average Response Time: ${simulationState.systemMetrics.averageResponseTime}
Reliability: ${simulationState.systemMetrics.reliability}

Provide a detailed explanation of the '${metric}' metric. Explain what it is, how it is calculated, and what factors can affect it. Use beginner-friendly language and provide actionable advice on how to improve this metric.

Example for the 'Reliability' metric:
Reliability is a measure of how likely your system is to be available and functioning correctly. It is calculated based on the reliability of each component in your system. A system with more components is generally less reliable than a system with fewer components. To improve the reliability of your system, you can use more reliable components, add redundancy, or implement failover mechanisms.`;

    try {
      const response = await fetch(openRouterUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'CanvasTutor',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenRouter API error for deep dive narration:', errorData);
        throw new Error(`OpenRouter API request failed with status ${response.status}: ${errorData.error.message || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const llmOutput = data.choices[0]?.message?.content;

      if (!llmOutput) {
        throw new Error('LLM response for deep dive narration was empty or in an unexpected format.');
      }

      return llmOutput.trim();

    } catch (error) {
      console.error('Error generating deep dive narration from LLM:', error);
      return 'I am unable to provide a deep dive explanation at this moment.';
    }
  }
}
