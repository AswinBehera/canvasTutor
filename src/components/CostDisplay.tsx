import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CostDisplayProps {
  totalCost: number;
  breakdown: { [nodeId: string]: number };
}

export function CostDisplay({ totalCost, breakdown }: CostDisplayProps) {
  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Cost Estimation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <p className="text-sm font-medium">Total Estimated Monthly Cost: <span className="font-bold">${totalCost.toFixed(2)}</span></p>
        </div>
        {Object.keys(breakdown).length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Breakdown:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {Object.entries(breakdown).map(([nodeId, cost]) => (
                <li key={nodeId}>{nodeId}: ${cost.toFixed(2)}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
