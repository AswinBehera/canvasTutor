import React from 'react';

interface CostDisplayProps {
  totalCost: number;
  breakdown: { [nodeId: string]: number };
}

const getCostClass = (cost: number) => {
  if (cost > 200) {
    return 'text-red-500 font-bold';
  } else if (cost > 50) {
    return 'text-yellow-500 font-semibold';
  }
  return 'text-green-500';
};

export function CostDisplay({ totalCost, breakdown }: CostDisplayProps) {
  return (
    <div className="w-full h-full p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Cost Estimation</h3>
      <div className="mb-2">
        <p className="text-sm font-medium">
          Total Estimated Monthly Cost: <span className={`font-bold ${getCostClass(totalCost)}`}>${totalCost.toFixed(2)}</span>
        </p>
      </div>
      {Object.keys(breakdown).length > 0 && (
        <div className="flex-grow overflow-y-auto">
          <p className="text-sm font-medium mb-1">Breakdown:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            {Object.entries(breakdown).map(([nodeId, cost]) => (
              <li key={nodeId}>
                {nodeId}: <span className={getCostClass(cost)}>${cost.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
