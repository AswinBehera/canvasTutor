import React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input'; // Import Input
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button'; // Import Button
import { Toggle } from '@/components/ui/toggle'; // Import Toggle
import { Loader2 } from "lucide-react"; // Import Loader2
import type { ControlsState } from '@/types';


interface ControlsPanelProps {
  controls: ControlsState;
  onControlChange: (key: keyof ControlsState, value: any) => void;
  onPlaySimulation: () => void;
  isSimulating: boolean;
  onToggleShowMath: (show: boolean) => void; // New prop
  showMath: boolean; // New prop
}

export const ControlsPanel = React.memo(function ControlsPanel({
  controls,
  onControlChange,
  onPlaySimulation,
  isSimulating,
  onToggleShowMath,
  showMath,
}: ControlsPanelProps) {
  return (
    <Card className="w-full border-none shadow-none"> {/* Remove border and shadow from Card */}
      <CardContent className="flex items-center justify-center gap-x-2 gap-y-2 p-2"> {/* Use flex for horizontal layout */}
        <div className="flex flex-col items-start gap-1 p-2 bg-gray-50 rounded-md"> {/* Adjust individual control styling */}
          <Label htmlFor="traffic" className="whitespace-nowrap">Traffic: {controls.traffic}</Label>
          <Slider
            id="traffic"
            min={0}
            max={1000}
            step={10}
            value={[controls.traffic]}
            onValueChange={([value]) => onControlChange('traffic', value)}
            className="w-24" // Constrain slider width
          />
        </div>
        <div className="flex flex-col items-start gap-1 p-2 bg-gray-50 rounded-md">
          <Label htmlFor="instances" className="whitespace-nowrap">Instances</Label>
          <Input
            id="instances"
            type="number"
            min={1}
            max={10}
            value={controls.instances}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 1 && value <= 10) {
                onControlChange('instances', value);
              }
            }}
            className="w-20 text-center" // Constrain input width
          />
        </div>
        <div className="flex flex-col items-start gap-1 p-2 bg-gray-50 rounded-md">
          <Label className="whitespace-nowrap">Cache</Label>
          <ToggleGroup
            type="single"
            value={controls.cache}
            onValueChange={(value) => onControlChange('cache', value)}
          >
            <ToggleGroupItem value="off">Off</ToggleGroupItem>
            <ToggleGroupItem value="small">Small</ToggleGroupItem>
            <ToggleGroupItem value="large">Large</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex flex-col items-start gap-1 p-2 bg-gray-50 rounded-md">
          <Label className="whitespace-nowrap">Vendor</Label>
          <ToggleGroup
            type="single"
            value={controls.vendor}
            onValueChange={(value) => onControlChange('vendor', value)}
          >
            <ToggleGroupItem value="managed">Managed</ToggleGroupItem>
            <ToggleGroupItem value="diy">DIY</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Button onClick={onPlaySimulation} disabled={isSimulating} className="whitespace-nowrap">
          {isSimulating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSimulating ? 'Simulating...' : 'Play Simulation'}
        </Button>
        <div className="flex flex-col items-start gap-1 p-2 bg-gray-50 rounded-md">
          <Label htmlFor="show-math" className="whitespace-nowrap">Show Math</Label>
          <Toggle
            id="show-math"
            pressed={showMath}
            onPressedChange={onToggleShowMath}
          >
            {showMath ? 'On' : 'Off'}
          </Toggle>
        </div>
      </CardContent>
    </Card>
  );
});
