import type { Node, Edge, NodeChange, EdgeChange, Connection, XYPosition } from '@xyflow/react';

export interface AppState {
  currentStep: 'input' | 'canvas' | 'simulation';
  userInput: string;
  components: ComponentCard[];
  canvasNodes: Node<CustomNodeData>[];
  canvasEdges: Edge[];
  simulationState: SimulationState;
  controls: ControlsState; // New
  isSimulating: boolean; // New
  showMath: boolean; // New
  isSaving: boolean; // New
  chatbotMessages: { role: 'user' | 'assistant'; content: string }[]; // New
  isChatbotResponding: boolean; // New
  totalCost: number; // New
  costBreakdown: { [nodeId: string]: number }; // New
}

export interface Session {
  id: string;
  name: string;
  timestamp: number;
  state: AppState; // Store the entire AppState for the session
}

export interface InputPromptProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export interface UserInput {
  description: string;
  goal?: string;
  features?: string;
  techPreferences?: string;
}

export interface ComponentCard {
  id: string;
  label: string;
  description: string;
  techOptions: [string, string]; // [managed, diy]
  category: 'frontend' | 'backend' | 'database' | 'auth' | 'storage' | 'other';
  baseMetrics?: { responsiveness: number; cost: number; reliability: number; };
  scalingFactors?: { traffic: number; instances: number; };
}

export interface ExtractorResponse {
  components: ComponentCard[];
  confidence: number;
  suggestions: string[];
}

export interface CanvasProps {
  components: ComponentCard[];
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeDrop: (component: ComponentCard, position: XYPosition) => void;
}

export type CustomNodeData = {
  componentId?: string; // Optional, as it might not always be present
  label: string;
  description: string;
  techChoice?: 'managed' | 'diy'; // Optional
  category: 'frontend' | 'backend' | 'database' | 'auth' | 'storage' | 'other';
  baseMetrics: { responsiveness: number; cost: number; reliability: number; };
  scalingFactors: { traffic: number; instances: number; };
  techOptions: [string, string]; // Add techOptions
  [key: string]: unknown;
};

export interface NodeMetrics {
  responsiveness: number; // 0-100
  traffic: number; // current traffic
  cost: number; // monthly cost estimate
  reliability: number; // 0-100
}

export interface ControlsState {
  traffic: number; // 0-1000
  instances: number; // 1-10
  cache: 'off' | 'small' | 'large';
  vendor: 'managed' | 'diy';
}

export interface ControlsPanelProps {
  controls: ControlsState;
  onControlChange: (key: keyof ControlsState, value: any) => void;
  onPlaySimulation: () => void;
  isSimulating: boolean;
}

export interface SimulationEngine {
  calculateMetrics(
    nodes: Node[],
    edges: Edge[],
    controls: ControlsState
  ): Promise<SimulationResult>;
  
  animateDataFlow(edges: Edge[]): void;
  
  generateNarration(
    previousState: SimulationState,
    newState: SimulationState,
    changedControl: string
  ): string;
}

export interface SimulationState {
    nodeMetrics: Map<string, NodeMetrics>;
    systemMetrics: {
        totalCost: number;
        averageResponseTime: number;
        reliability: number;
    };
    recommendations: string[];
    controls: ControlsState;
}

export interface SimulationResult {
  nodeMetrics: Map<string, NodeMetrics>;
  systemMetrics: {
    totalCost: number;
    averageResponseTime: number;
    reliability: number;
  };
  recommendations: string[];
  controls: ControlsState;
}

export interface ComponentTemplate {
    label: string;
    description: string;
    techOptions: [string, string];
    baseMetrics: { responsiveness: number; cost: number; reliability: number; };
    scalingFactors: { traffic: number; instances: number; };
}

export interface SimulationRules {
  trafficImpact: {
    responsiveness: (traffic: number) => number;
    cost: (traffic: number) => number;
  };
  
  instanceScaling: {
    responsiveness: (instances: number) => number;
    cost: (instances: number) => number;
  };
  
  cacheEffects: {
    off: { responsiveness: 1.0, cost: 1.0 };
    small: { responsiveness: 1.2, cost: 1.1 };
    large: { responsiveness: 1.5, cost: 1.3 };
  };
  
  vendorMultipliers: {
    managed: { responsiveness: 1.1, cost: 1.4, reliability: 1.2 };
    diy: { responsiveness: 0.9, cost: 0.7, reliability: 0.8 };
  };
}

export interface ErrorRecovery {
  componentExtraction: {
    fallback: () => ComponentCard[]; // Return default components
    retry: (input: string) => Promise<ComponentCard[]>;
  };
  
  simulation: {
    fallback: () => SimulationResult; // Return safe default values
    gracefulDegradation: boolean; // Continue with partial results
  };
  
  canvas: {
    resetToLastGoodState: () => void;
    clearAndRestart: () => void;
  };
}