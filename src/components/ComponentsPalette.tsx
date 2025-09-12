import React from 'react';
import type { ComponentCard as ComponentCardType } from '@/types';
import { ComponentCard } from './ComponentCard';

interface ComponentsPaletteProps {
  components: ComponentCardType[];
}

export const ComponentsPalette = React.memo(function ComponentsPalette({ components }: ComponentsPaletteProps) {
  return (
    <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
      {components.length === 0 ? (
        <p className="text-muted-foreground text-sm">No components generated yet. Describe your system to get started!</p>
      ) : (
        components.map((component) => (
          <ComponentCard key={component.id} card={component} />
        ))
      )}
    </div>
  );
});
