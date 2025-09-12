import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExtractionInsightsProps {
  confidence: number | null;
  suggestions: string[];
}

export function ExtractionInsights({ confidence, suggestions }: ExtractionInsightsProps) {
  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-lg">AI Extraction Insights</CardTitle>
        <p className="text-sm text-muted-foreground">How confident our AI is in the generated components and what else it suggests.</p>
      </CardHeader>
      <CardContent>
        {confidence !== null && (
          <div className="mb-2">
            <p className="text-sm font-medium">Confidence Score: <Badge variant="secondary">{confidence.toFixed(2)}%</Badge></p>
          </div>
        )}
        {suggestions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Suggestions:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        {confidence === null && suggestions.length === 0 && (
          <p className="text-sm text-muted-foreground">No insights available.</p>
        )}
      </CardContent>
    </Card>
  );
}
