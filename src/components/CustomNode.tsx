import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CustomNodeData } from '@/types';
import { Monitor, Server, Database, Key, HardDrive, Box, Layers, Shield } from 'lucide-react'; // Import icons
import { useAppState } from '../context/AppStateContext';

interface CustomNodeProps {
  data: CustomNodeData;
  selected: boolean; // Add selected prop
}

const categoryStyles: Record<string, { bgColor: string; icon: React.ElementType }> = {
  frontend: { bgColor: 'bg-blue-500', icon: Monitor },
  backend: { bgColor: 'bg-green-500', icon: Server },
  database: { bgColor: 'bg-purple-500', icon: Database },
  auth: { bgColor: 'bg-orange-500', icon: Key },
  storage: { bgColor: 'bg-yellow-500', icon: HardDrive },
  other: { bgColor: 'bg-gray-500', icon: Box },
};

const CONTEXTUAL_PROMPTS = [
  "Explain this component in detail.",
  "How does this component scale with traffic?",
  "What are common issues or failure modes for this component?",
  "Suggest alternative technologies for this component.",
  "How does this component interact with other components in a typical system?",
];

export function CustomNode({ data, selected }: CustomNodeProps) {
  const { label, description, baseMetrics, componentId, techChoice: initialTechChoice, techOptions, category } = data;
  const [techChoice, setTechChoice] = useState<'managed' | 'diy'>(initialTechChoice || techOptions[0] as 'managed' | 'diy');
  const { onSendAdaMessage, onSetChatInput } = useAppState(); // Get onSendAdaMessage and onSetChatInput from context

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null); // Ref for the node element

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenuVisible(true);

    // Calculate position relative to the node
    if (nodeRef.current) {
      const nodeRect = nodeRef.current.getBoundingClientRect();
      setContextMenuPosition({
        x: event.clientX - nodeRect.left, // Position relative to node's left edge
        y: event.clientY - nodeRect.top, // Position relative to node's top edge
      });
    }
  };

  const handlePromptClick = (promptTemplate: string) => {
    const fullPrompt = `Regarding the ${label} component (ID: ${componentId}, Category: ${category}, Description: ${description}): ${promptTemplate}`;
    onSetChatInput(fullPrompt); // Set the chat input field
    setContextMenuVisible(false);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenuVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getResponsivenessEmoji = (responsiveness: number) => {
    if (responsiveness > 90) return '🚀';
    if (responsiveness > 70) return '✅';
    if (responsiveness > 50) return '🤔';
    return '🔥';
  };

  const { bgColor, icon: Icon } = categoryStyles[category] || categoryStyles.other;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={nodeRef} // Add ref to the node div
            className={`flex flex-col items-center justify-center p-4 rounded-full text-white w-36 h-36 shadow-md transition-all duration-200 ease-in-out hover:scale-105 ${bgColor} ${selected ? 'border-4 border-blue-300 ring-4 ring-blue-300' : ''}`}
            style={{ border: selected ? '4px solid #60a5fa' : `4px dashed #ffffff` }} // More prominent selection
            onContextMenu={handleContextMenu} // Add context menu handler
          >
            <Handle type="target" position={Position.Left} className="!bg-white" />
            <div className="absolute -top-4 bg-black rounded-full p-2 z-10">
              <Icon size={24} className="text-white" />
            </div>
            <div className="flex flex-col items-center justify-center flex-grow mt-4">
              <div className="text-base font-bold text-center leading-tight">{label}</div>
              <div className="text-sm text-center mt-1">{getResponsivenessEmoji(baseMetrics.responsiveness)} ${baseMetrics.cost}/mo</div>
            </div>
            
            {/* Tech Choice Toggle */}
            <div className="absolute bottom-2 flex-shrink-0">
              <ToggleGroup type="single" value={techChoice} onValueChange={(value: 'managed' | 'diy') => setTechChoice(value)} className="space-x-1 bg-white bg-opacity-20 rounded-md p-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="managed" className="text-xs px-2 py-1 h-auto text-white data-[state=on]:bg-blue-600 data-[state=on]:text-white">M</ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{techOptions[0]}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="diy" className="text-xs px-2 py-1 h-auto text-white data-[state=on]:bg-blue-600 data-[state=on]:text-white">D</ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{techOptions[1]}</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroup>
            </div>
            <Handle type="source" position={Position.Right} className="!bg-white" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>

      {contextMenuVisible && (
        <div
          ref={contextMenuRef}
          className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2 flex flex-col space-y-1"
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          {CONTEXTUAL_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 text-left whitespace-nowrap"
              onClick={() => handlePromptClick(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </TooltipProvider>
  );
}
