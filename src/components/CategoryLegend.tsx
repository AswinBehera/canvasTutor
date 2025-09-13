import React from 'react';
import { Monitor, Server, Database, Key, HardDrive, Box, Layers, Shield } from 'lucide-react';

const categoryStyles: Record<string, { bgColor: string; icon: React.ElementType }> = {
  frontend: { bgColor: 'bg-blue-500', icon: Monitor },
  backend: { bgColor: 'bg-green-500', icon: Server },
  database: { bgColor: 'bg-purple-500', icon: Database },
  auth: { bgColor: 'bg-orange-500', icon: Key },
  storage: { bgColor: 'bg-yellow-500', icon: HardDrive },
  network: { bgColor: 'bg-red-500', icon: Layers }, // Assuming red for network
  messaging: { bgColor: 'bg-indigo-500', icon: Box }, // Assuming indigo for messaging
  logging: { bgColor: 'bg-gray-500', icon: Shield }, // Assuming gray for logging
  other: { bgColor: 'bg-gray-500', icon: Box },
};

export const CategoryLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 right-4 bg-white p-4 rounded-md shadow-lg z-10">
      <h3 className="text-lg font-semibold mb-2">Node Categories</h3>
      <div className="space-y-1">
        {Object.entries(categoryStyles).map(([category, { bgColor, icon: Icon }]) => (
          <div key={category} className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${bgColor}`}></div>
            <Icon size={16} className="text-gray-700" />
            <span className="text-sm text-gray-800 capitalize">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};