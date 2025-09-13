import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Import Button
import { Loader2 } from "lucide-react"; // Import Loader2
import { Link } from "react-router-dom";
import type { ControlsState } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ControlsPanelProps {
    controls: ControlsState;
    onControlChange: (key: keyof ControlsState, value: number) => void;
    onPlaySimulation: () => void;
    isSimulating: boolean;
    onExportClick: () => void; // New prop for Export button
    trafficThresholds: number[]; // New prop for visualizing thresholds
}

export const ControlsPanel = React.memo(function ControlsPanel({
    controls,
    onControlChange,
    onPlaySimulation,
    isSimulating,
    onExportClick, // Destructure new prop
    trafficThresholds, // Destructure new prop
}: ControlsPanelProps) {
    const getThresholdLabel = (threshold: number) => {
        if (threshold >= 1000000) return `${threshold / 1000000}M`;
        if (threshold >= 1000) return `${threshold / 1000}K`;
        return String(threshold);
    };

    return (
        <div className='flex items-center justify-between w-full m-4'>
            <Link to='/' className='text-2xl font-bold text-primary ml-4 mr-4'>
                CanvasTutor
            </Link>
            <div className='flex items-center gap-x-4 gap-y-2'>
                <Tabs
                    value={String(controls.traffic)} // Convert number to string for Tabs component
                    onValueChange={(value) => onControlChange("traffic", Number(value))}
                    className="w-[400px]"
                >
                    <TabsList className="grid w-full grid-cols-5">
                        {trafficThresholds.map((threshold) => (
                            <TabsTrigger key={threshold} value={String(threshold)}>
                                {getThresholdLabel(threshold)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <Button
                    onClick={onPlaySimulation}
                    disabled={isSimulating}
                    className='whitespace-nowrap w-32' // Added h-24 and w-32
                >
                    {isSimulating && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    {isSimulating ? "Simulating..." : "Simulate"}
                </Button>
                <Button
                    onClick={onExportClick} // New Export button
                    className='whitespace-nowrap'
                >
                    Export
                </Button>
            </div>
        </div>
    );
});
