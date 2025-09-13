import type { ComponentCard } from '@/types';
import type { Edge } from '@xyflow/react'; // Import Edge type

export class ComponentExtractorService {
  async extractComponents(userInput: string): Promise<{ nodes: ComponentCard[], edges: Edge[] }> {
    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || 'YOUR_OPENROUTER_API_KEY'; // Replace with your actual key or set as environment variable
    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const modelName = 'openai/gpt-oss-20b'; // OpenRouter specific model ID

    console.log('Authorization Header:', `Bearer ${OPENROUTER_API_KEY}`);

    const prompt = `You are an AI assistant that helps design system architectures.
Based on the following user description, suggest 3-8 core components for a software system (nodes) and logical connections between them (edges).
For each component (node), provide an 'id' (unique string), 'label' (short name), 'description' (1-line friendly explanation), 'techOptions' (an array of two strings: [managed_service_option, diy_option]), 'category' (e.g., 'frontend', 'backend', 'database', 'auth', 'storage', 'other'), 'baseMetrics' (an object with responsiveness, cost, and reliability, each a number between 0-100), and 'scalingFactors' (an object with traffic and instances, each a number between 0-1).
For each connection (edge), provide an 'id' (unique string), 'source' (source node id), 'target' (target node id), and 'type' (always 'animated').

Return the output as a STRICT JSON object with all property names double-quoted.

User description: "${userInput}"

Example output format:
{
  "nodes": [
    {
      "id": "auth1",
      "label": "User Authentication",
      "description": "Handles user sign-up, login, and session management.",
      "techOptions": ["Auth0", "Node.js with Passport.js"],
      "category": "auth",
      "baseMetrics": { "responsiveness": 85, "cost": 20, "reliability": 95 },
      "scalingFactors": { "traffic": 0.1, "instances": 0.8 }
    },
    {
      "id": "db1",
      "label": "Database",
      "description": "Stores user data, posts, and other application information.",
      "techOptions": ["MongoDB Atlas", "PostgreSQL"],
      "category": "database",
      "baseMetrics": { "responsiveness": 70, "cost": 50, "reliability": 90 },
      "scalingFactors": { "traffic": 0.2, "instances": 0.6 }
    }
  ],
  "edges": [
    {
      "id": "e-auth1-db1",
      "source": "auth1",
      "target": "db1",
      "type": "animated"
    }
  ]
}
`;

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
        console.error('OpenRouter API error:', errorData);
        throw new Error(`OpenRouter API request failed with status ${response.status}: ${errorData.error.message || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('Raw OpenRouter Response Data:', data);
      const llmOutput = data.choices[0]?.message?.content;

      if (!llmOutput) {
        console.warn('LLM response was empty or in an unexpected format. Returning empty nodes and edges.');
        return { nodes: [], edges: [] };
      }

      console.log('Raw LLM Output:', llmOutput);

      // Remove markdown code block fences if present
      const cleanedLlmOutput = llmOutput.replace(/^```json\s*|\s*```$/g, '').trim();
      let parsedOutput: { nodes: ComponentCard[], edges: Edge[] };
      try {
        parsedOutput = JSON.parse(cleanedLlmOutput);
      } catch (parseError) {
        console.error('Error parsing LLM output as JSON:', parseError);
        console.warn('LLM returned invalid JSON. Returning empty nodes and edges.');
        return { nodes: [], edges: [] };
      }

      // Basic validation for nodes
      if (!Array.isArray(parsedOutput.nodes) || parsedOutput.nodes.some(c => !c.id || !c.label || !c.description || !Array.isArray(c.techOptions) || c.techOptions.length !== 2 || !c.category)) {
        console.warn('LLM returned nodes in an unexpected format. Returning empty nodes and edges.');
        return { nodes: [], edges: [] };
      }

      // Basic validation for edges
      if (!Array.isArray(parsedOutput.edges) || parsedOutput.edges.some(e => !e.id || !e.source || !e.target || e.type !== 'animated')) {
        console.warn('LLM returned edges in an unexpected format. Returning empty nodes and edges.');
        return { nodes: parsedOutput.nodes, edges: [] }; // Return nodes even if edges are bad
      }

      return parsedOutput;

    } catch (error) {
      console.error('Error extracting components from LLM:', error);
      // Return empty components in case of an error
      return { nodes: [], edges: [] };
    }
  }
}
