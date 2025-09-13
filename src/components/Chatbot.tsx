import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming you have a scroll-area component
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatbotProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: { role: 'user' | 'assistant'; content: string }[];
  isResponding: boolean;
}

export function Chatbot({ onSendMessage, messages = [], isResponding }: ChatbotProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true); // Add a ref to track initial mount

  const handleSend = async () => {
    if (input.trim()) {
      await onSendMessage(input);
      setInput('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false; // Set to false after first render
      return; // Don't scroll on initial mount
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-2 border rounded-md mb-2 h-[calc(100%-50px)]">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.role === 'user' ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
            </span>
          </div>
        ))}
        {isResponding && (
          <div className="text-left mb-1">
            <span className="inline-block p-2 rounded-lg bg-gray-200 text-gray-800">
              <Loader2 className="h-4 w-4 animate-spin inline-block mr-1" />
              Thinking...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <div className="mb-2 flex flex-wrap gap-2"> {/* Suggestion cue cards */}
        {["Explain Cost", "Optimize Traffic", "Suggest Cache"].map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => setInput(suggestion)}
            disabled={isResponding}
            className="text-xs px-2 py-1 h-auto"
          >
            {suggestion}
          </Button>
        ))}
      </div>
      <div className="flex">
        <Input
          type="text"
          placeholder="Ask Ada..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          className="flex-grow mr-2"
          disabled={isResponding}
        />
        <Button onClick={handleSend} disabled={isResponding}>
          Send
        </Button>
      </div>
    </div>
  );
}
