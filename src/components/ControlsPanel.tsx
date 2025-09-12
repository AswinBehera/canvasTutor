import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input"; // Import Input
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button"; // Import Button
import { Toggle } from "@/components/ui/toggle"; // Import Toggle
import { Loader2 } from "lucide-react"; // Import Loader2
import { Link } from "react-router-dom";
import type { ControlsState } from "@/types";

interface ControlsPanelProps {
    controls: ControlsState;
    onControlChange: (key: keyof ControlsState, value: any) => void;
    onPlaySimulation: () => void;
    isSimulating: boolean;
    onToggleShowMath: (show: boolean) => void; // New prop
    showMath: boolean; // New prop
    onSaveSession: () => void; // New prop
}

export const ControlsPanel = React.memo(function ControlsPanel({
    controls,
    onControlChange,
    onPlaySimulation,
    isSimulating,
    onToggleShowMath,
    showMath,
    onSaveSession,
}: ControlsPanelProps) {
    return (
        <div className='flex items-center justify-between w-full m-4'>
            <Link to='/' className='text-2xl font-bold text-primary ml-4 mr-4'>
                CanvasTutor
            </Link>
            <div className='flex items-center gap-x-4 gap-y-2'>
                <Card className='h-24'>
                    <CardHeader className='p-2'>
                        <CardTitle className='text-base'>
                            <Label
                                htmlFor='traffic'
                                className='whitespace-nowrap text-center'
                            >
                                Traffic: {controls.traffic}
                            </Label>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className=''>
                        <Slider
                            id='traffic'
                            min={0}
                            max={1000}
                            step={10}
                            value={[controls.traffic]}
                            onValueChange={([value]) =>
                                onControlChange("traffic", value)
                            }
                            className='w-24' // Constrain slider width
                        />
                    </CardContent>
                </Card>
                <Card className='p-2 h-24'>
                    <CardHeader className='p-0 pt-2'>
                        <CardTitle className='text-base'>
                            <Label
                                htmlFor='instances'
                                className='whitespace-nowrap'
                            >
                                Instances
                            </Label>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='p-0'>
                        <Input
                            id='instances'
                            type='number'
                            min={1}
                            max={10}
                            value={controls.instances}
                            onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                if (
                                    !isNaN(value) &&
                                    value >= 1 &&
                                    value <= 10
                                ) {
                                    onControlChange("instances", value);
                                }
                            }}
                            className='w-20 text-center' // Constrain input width
                        />
                    </CardContent>
                </Card>
                <Card className='p-2 h-24'>
                    <CardHeader className='p-0 pt-2'>
                        <CardTitle className='text-base'>
                            <Label className='whitespace-nowrap'>Cache</Label>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='p-0'>
                        <ToggleGroup
                            type='single'
                            value={controls.cache}
                            onValueChange={(value) =>
                                onControlChange("cache", value)
                            }
                        >
                            <ToggleGroupItem value='off' className='px-2 py-1'>
                                Off
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value='small'
                                className='px-2 py-1'
                            >
                                Small
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value='large'
                                className='px-2 py-1'
                            >
                                Large
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </CardContent>
                </Card>
                <Card className='p-2 h-24'>
                    <CardHeader className='p-0 pt-2'>
                        <CardTitle className='text-base'>
                            <Label className='whitespace-nowrap'>Vendor</Label>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='p-0'>
                        <ToggleGroup
                            type='single'
                            value={controls.vendor}
                            onValueChange={(value) =>
                                onControlChange("vendor", value)
                            }
                        >
                            <ToggleGroupItem
                                value='managed'
                                className='px-2 py-1 w-32'
                            >
                                Managed
                            </ToggleGroupItem>
                            <ToggleGroupItem value='diy' className='px-2 py-1'>
                                DIY
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </CardContent>
                </Card>
                <Button
                    onClick={onPlaySimulation}
                    disabled={isSimulating}
                    className='whitespace-nowrap'
                >
                    {isSimulating && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    {isSimulating ? "Simulating..." : "Play Simulation"}
                </Button>
                <Button
                    onClick={onSaveSession}
                    className='whitespace-nowrap'
                >
                    Save
                </Button>
                {/*
        <Card className="p-2 h-24">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base">
              <Label htmlFor="show-math" className="whitespace-nowrap">Show Math</Label>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <Toggle
              id="show-math"
              pressed={showMath}
              onPressedChange={onToggleShowMath}
            >
              {showMath ? 'On' : 'Off'}
            </Toggle>
          </CardContent>
        </Card>
        */}
            </div>
        </div>
    );
});
