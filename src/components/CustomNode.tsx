import React, { useState } from 'react';
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

export function CustomNode({ data, selected }: CustomNodeProps) {
  const { label, description, baseMetrics, componentId, techChoice: initialTechChoice, techOptions, category } = data;
  const [techChoice, setTechChoice] = useState<'managed' | 'diy'>(initialTechChoice || techOptions[0] as 'managed' | 'diy');
  const { state } = useAppState();
  const { controls } = state;

  const getResponsivenessEmoji = (responsiveness: number) => {
    if (responsiveness > 90) return '🚀';
    if (responsiveness > 70) return '✅';
    if (responsiveness > 50) return '🤔';
    return '🔥';
  };

  const { bgColor, icon: Icon } = categoryStyles[category] || categoryStyles.other;

  const borderStyle = controls.vendor === 'managed' ? 'solid' : 'dashed';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex flex-col items-center justify-center p-4 rounded-full text-white w-32 h-32 shadow-md ${bgColor} ${selected ? 'border-4 border-blue-300 ring-4 ring-blue-300' : ''}`}
            style={{ border: selected ? '4px solid #60a5fa' : `4px ${borderStyle} #ffffff` }} // More prominent selection
          >
            <Handle type="target" position={Position.Left} className="!bg-white" />
            <Icon size={32} className="mb-2" />
            <div className="text-sm font-bold text-center">{label}</div>
            <div className="text-xs text-center">ID: {componentId}</div>
            <div className="text-xs text-center">{getResponsivenessEmoji(baseMetrics.responsiveness)} ${baseMetrics.cost}/mo</div>
            <div className="absolute top-0 right-2 text-xs">x{controls.instances}</div>
            {controls.cache !== 'off' && <Layers className="absolute top-1 left-2" size={16} />}
            
            {/* Tech Choice Toggle - simplified for horizontal layout */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center p-1 bg-black bg-opacity-50 rounded-b-full">
              <ToggleGroup type="single" value={techChoice} onValueChange={(value: 'managed' | 'diy') => setTechChoice(value)} className="space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="managed" className="text-xs px-1 py-0.5">M</ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{techOptions[0]}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="diy" className="text-xs px-1 py-0.5">D</ToggleGroupItem>
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
    </TooltipProvider>
  );
}
