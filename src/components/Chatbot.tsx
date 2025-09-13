import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming you have a scroll-area component
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import type { Node, Edge } from '@xyflow/react';
import type { CustomNodeData, ControlsState } from '@/types';

interface ChatbotProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: { role: 'user' | 'assistant'; content: string }[];
  isResponding: boolean;
  input: string; // New prop for controlled input
  onInputChange: (value: string) => void; // New prop for input change handler
  canvasNodes: Node<CustomNodeData>[]; // New: Pass current nodes for context
  canvasEdges: Edge[]; // New: Pass current edges for context
  controls: ControlsState; // New: Pass current controls for context
}

export function Chatbot({ onSendMessage, messages = [], isResponding, input, onInputChange, canvasNodes, canvasEdges, controls }: ChatbotProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true); // Add a ref to track initial mount

  const handleSend = async () => {
    if (input.trim()) {
      await onSendMessage(input);
      onInputChange(''); // Clear input after sending
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
        {[{
          label: "Explain Cost",
          prompt: `Considering the current system architecture with a traffic of ${controls.traffic} users, please provide a detailed explanation of the cost implications. The system components include: ${canvasNodes.map(n => `${n.data.label} (${n.data.category}, Managed: ${n.data.techOptions[0]}, DIY: ${n.data.techOptions[1]}, Base Cost: ${n.data.baseMetrics?.cost})`).join("; ")}. How do these components and their interactions contribute to the overall cost, and what factors might influence it further?`
        }, {
          label: "Optimize Traffic",
          prompt: `Our current system is handling ${controls.traffic} users. Please suggest strategies to optimize its performance and scalability for this traffic level. The existing components are: ${canvasNodes.map(n => `${n.data.label} (${n.data.category}, Managed: ${n.data.techOptions[0]}, DIY: ${n.data.techOptions[1]})`).join("; ")}. How can we enhance the system to efficiently manage and scale with the given traffic, considering these components?`
        }, {
          label: "Suggest Cache",
          prompt: `Given the current system architecture and a traffic of ${controls.traffic} users, what caching strategies would you recommend? The system components include: ${canvasNodes.map(n => `${n.data.label} (${n.data.category}, Managed: ${n.data.techOptions[0]}, DIY: ${n.data.techOptions[1]})`).join("; ")}. Please explain how these strategies would integrate with our existing setup and the benefits they would provide.`
        }].map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onInputChange(suggestion.prompt)} // Use onInputChange with detailed prompt
            disabled={isResponding}
            className="text-xs px-2 py-1 h-auto"
          >
            {suggestion.label}
          </Button>
        ))}
      </div>
      <div className="flex">
        <Input
          type="text"
          placeholder="Ask Ada..."
          value={input}
          onChange={(e) => onInputChange(e.target.value)} // Use onInputChange
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
