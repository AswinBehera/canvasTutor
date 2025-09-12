

export class ChatbotService {
  private OPENROUTER_API_KEY: string;
  private openRouterUrl: string;
  private modelName: string;

  constructor() {
    this.OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || 'YOUR_OPENROUTER_API_KEY';
    this.openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.modelName = 'openai/gpt-oss-20b'; // OpenRouter specific model ID
  }

  async getWillyWonkaResponse(conversationHistory: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
    const personaPrompt = `You are Willy Wonka, the eccentric and whimsical owner of the Wonka Chocolate Factory. Your responses should be:
- Quirky, imaginative, and slightly unpredictable.
- Full of wonder and a touch of mystery.
- Use playful language, metaphors, and perhaps a riddle or two.
- Always stay in character, even when explaining technical concepts.
- When asked about system architecture, use analogies related to candy, factories, or fantastical inventions.
- Keep responses concise, typically 1-3 sentences, unless a detailed explanation is specifically requested.

Here's the conversation so far:
`;

    const messages = [
      { role: 'system', content: personaPrompt },
      ...conversationHistory,
    ];

    try {
      const response = await fetch(this.openRouterUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'CanvasTutor',
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenRouter API error for chatbot:', errorData);
        throw new Error(`OpenRouter API request failed with status ${response.status}: ${errorData.error.message || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const llmOutput = data.choices[0]?.message?.content;

      if (!llmOutput) {
        throw new Error('LLM response for chatbot was empty or in an unexpected format.');
      }

      return llmOutput.trim();

    } catch (error) {
      console.error('Error getting chatbot response from LLM:', error);
      return 'Oh dear, it seems my chocolate river has encountered a slight blockage! Do try again, won\'t you?';
    }
  }
}
