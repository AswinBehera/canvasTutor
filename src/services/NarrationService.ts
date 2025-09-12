import type { SimulationState } from '@/types';

export class NarrationService {
  async generateNarration(
    previousState: SimulationState,
    newState: SimulationState,
    changedControl: string
  ): Promise<string> {
    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || 'YOUR_OPENROUTER_API_KEY'; // Replace with your actual key or set as environment variable
const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
const modelName = 'openai/gpt-oss-20b'; // OpenRouter specific model ID

    const prompt = `You are an AI assistant providing plain-English explanations for system simulation changes.

Here's the previous state of the system:
Total Cost: ${previousState.systemMetrics.totalCost}
Average Response Time: ${previousState.systemMetrics.averageResponseTime}
Reliability: ${previousState.systemMetrics.reliability}

Here's the new state after changing the '${changedControl}' control:
Total Cost: ${newState.systemMetrics.totalCost}
Average Response Time: ${newState.systemMetrics.averageResponseTime}
Reliability: ${newState.systemMetrics.reliability}

Explain in 1-2 sentences what happened and why, using beginner-friendly language without technical jargon. Also, provide one practical, cost-effective suggestion related to the change.

Example:
Changing the traffic from low to high made your system more expensive and a bit slower. Consider adding a caching layer to improve responsiveness without significantly increasing costs.`;

    try {
      const response = await fetch(openRouterUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173', // Replace with your actual site URL
          'X-Title': 'CanvasTutor', // Replace with your actual site name
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

      return llmOutput.trim();

    } catch (error) {
      console.error('Error generating narration from LLM:', error);
      return 'The simulation has been updated. I am unable to provide a detailed explanation at this moment.';
    }
  }
}
