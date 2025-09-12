import React, { useState } from 'react';
import type { ComponentCard as ComponentCardType } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface ComponentCardProps {
  card: ComponentCardType;
}

export function ComponentCard({ card }: ComponentCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    setIsDragging(true);
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card
      className={`cursor-grab ${isDragging ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
      draggable
      onDragStart={(event) => onDragStart(event, JSON.stringify(card))}
      onDragEnd={onDragEnd}
    >
      <CardHeader>
        <CardTitle>{card.label}</CardTitle>
        <CardDescription>{card.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">ID: {card.id}</p>
        <p className="text-xs text-muted-foreground">Tech: {card.techOptions.join(' / ')}</p>
      </CardContent>
    </Card>
  );
}
