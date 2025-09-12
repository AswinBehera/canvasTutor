import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppState, ComponentCard, SimulationState } from '@/types';
import type { Node, Edge } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { componentsToNodes, getLayoutedElements } from '@/lib/utils'; // Import getLayoutedElements
import { SimulationService } from '../services/SimulationService';
import { ExportService } from '../services/ExportService'; // Import ExportService

import type { ControlsState, CustomNodeData } from '@/types'; // Import ControlsState, CustomNodeData

import { ChatbotService } from '../services/ChatbotService'; // Import ChatbotService

interface AppStateContextType {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  // Canvas related actions
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeDrop: (component: ComponentCard, position: { x: number; y: number }) => void;
  // Other actions
  setComponents: (components: ComponentCard[], initialEdges?: Edge[]) => void;
    setSimulationState: (simulationState: SimulationState) => void;
  setCurrentStep: (step: AppState['currentStep']) => void;
  onControlChange: (key: keyof ControlsState, value: any) => void;
  onPlaySimulation: () => void;
  onToggleShowMath: (show: boolean) => void; // New
  getCalculationDetails: (node: Node<CustomNodeData>, incomingTraffic: number, controls: ControlsState) => { formulas: string[]; breakdown: string[]; }; // New
  narration: string | null; // New
  isSaving: boolean; // New
  chatbotMessages: { role: 'user' | 'assistant'; content: string }[]; // New
  isChatbotResponding: boolean; // New
  onSendChatbotMessage: (message: string) => Promise<void>; // New
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setAppState] = useState<AppState>({
    currentStep: 'input',
    userInput: '',
    components: [],
    canvasNodes: [] as Node<CustomNodeData>[],
    canvasEdges: [],
    simulationState: {
      nodeMetrics: new Map(),
      systemMetrics: {
        totalCost: 0,
        averageResponseTime: 0,
        reliability: 0,
      },
      recommendations: [],
      controls: { // Initialize controls within simulationState
        traffic: 100,
        instances: 1,
        cache: 'off',
        vendor: 'managed',
      },
    },
    controls: {
      traffic: 100,
      instances: 1,
      cache: 'off',
      vendor: 'managed',
    },
    isSimulating: false,
    showMath: false, // New state for showing math
    narration: null, // New state for narration
    isSaving: false, // Initialize isSaving
    chatbotMessages: [], // Initialize chatbotMessages
    isChatbotResponding: false, // Initialize isChatbotResponding
  });

  const simulationService = new SimulationService();

  const onNodesChange = useCallback(
    (changes: any) => {
      setAppState((prevState) => ({
        ...prevState,
        canvasNodes: applyNodeChanges(changes, prevState.canvasNodes) as Node<CustomNodeData>[],
      }));
    },
    [],
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      setAppState((prevState) => ({
        ...prevState,
        canvasEdges: applyEdgeChanges(changes, prevState.canvasEdges) as Edge[],
      }));
    },
    [],
  );

  const onConnect = useCallback(
    (connection: any) => {
      setAppState((prevState) => ({
        ...prevState,
        canvasEdges: addEdge({ ...connection, type: 'animated' }, prevState.canvasEdges),
      }));
    },
    [],
  );

  const onNodeDrop = useCallback(
    (component: ComponentCard, position: { x: number; y: number }) => {
      const newNode: Node<CustomNodeData> = {
        id: component.id, // Use component.id directly for consistency
        type: 'custom',
        position,
        data: { label: component.label, description: component.description, category: component.category, baseMetrics: component.baseMetrics || { responsiveness: 0, cost: 0, reliability: 0 }, scalingFactors: component.scalingFactors || { traffic: 0, instances: 0 }, techOptions: component.techOptions },
      };
      setAppState((prevState) => ({
        ...prevState,
        canvasNodes: prevState.canvasNodes.concat(newNode),
      }));
    },
    [],
  );

  const setComponents = useCallback((components: ComponentCard[], initialEdges: Edge[] = []) => {
    console.log('setComponents called with initialEdges:', initialEdges);
    const newNodes = componentsToNodes(components);
    const { layoutedNodes, layoutedEdges } = getLayoutedElements(newNodes as Node<CustomNodeData>[], initialEdges); // Apply layout
    setAppState((prevState) => ({
      ...prevState,
      components,
      canvasNodes: layoutedNodes, // Initialize canvas nodes from extracted components
      canvasEdges: layoutedEdges, // Set initial edges
    }));
  }, []);

  const setSimulationState = useCallback((simulationState: SimulationState) => {
    setAppState((prevState) => ({
      ...prevState,
      simulationState: {
        ...simulationState,
        controls: prevState.controls, // Ensure controls are always present in simulationState
      },
    }));
  }, []);

  const setCurrentStep = useCallback((step: AppState['currentStep']) => {
    setAppState((prevState) => ({
      ...prevState,
      currentStep: step,
    }));
  }, []);

  const onControlChange = useCallback(
    (key: keyof ControlsState, value: any) => {
      setAppState((prevState) => ({
        ...prevState,
        controls: {
          ...prevState.controls,
          [key]: value,
        },
      }));

      // Trigger automatic narration after a debounce period
      // This will ensure narration is generated only after the user stops changing controls
      const debouncedGenerateNarration = setTimeout(async () => {
        const simulationResult = await simulationService.calculateMetrics(
          state.canvasNodes,
          state.canvasEdges,
          { ...state.controls, [key]: value } // Use the updated control value
        );

        const narration = await simulationService.generateNarration(
          state.simulationState, // Previous state
          simulationResult, // New state
          key as keyof ControlsState // Identify changed control
        );

        setAppState((prevState) => ({
          ...prevState,
          simulationState: {
            ...simulationResult,
            recommendations: [narration],
          },
          narration: narration,
        }));
      }, 500); // Debounce for 500ms

      // Clear previous debounce timeout if control changes again quickly
      return () => clearTimeout(debouncedGenerateNarration);
    },
    [state.canvasNodes, state.canvasEdges, state.controls, state.simulationState],
  );

  const onToggleShowMath = useCallback((show: boolean) => {
    setAppState((prevState) => ({ ...prevState, showMath: show }));
  }, []);

  const chatbotService = new ChatbotService(); // Instantiate ChatbotService

  const onSendChatbotMessage = useCallback(async (message: string) => {
    setAppState((prevState) => ({
      ...prevState,
      chatbotMessages: [...prevState.chatbotMessages, { role: 'user', content: message }],
      isChatbotResponding: true,
    }));

    try {
      const response = await chatbotService.getWillyWonkaResponse([
        ...state.chatbotMessages,
        { role: 'user', content: message },
      ]);

      setAppState((prevState) => ({
        ...prevState,
        chatbotMessages: [...prevState.chatbotMessages, { role: 'assistant', content: response }],
        isChatbotResponding: false,
      }));
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      setAppState((prevState) => ({
        ...prevState,
        chatbotMessages: [...prevState.chatbotMessages, { role: 'assistant', content: "Oh dear, it seems my chocolate river has encountered a slight blockage! Do try again, won't you?" }],
        isChatbotResponding: false,
      }));
    }
  }, [state.chatbotMessages]);

  const onPlaySimulation = useCallback(async () => {
    setAppState((prevState) => ({ ...prevState, isSimulating: true }));
    try {
      const simulationResult = await simulationService.calculateMetrics(
        state.canvasNodes as Node<CustomNodeData>[],
        state.canvasEdges,
        state.controls
      );

      const narration = await simulationService.generateNarration( // Await the narration
        state.simulationState, // Previous state
        simulationResult, // New state
        (Object.keys(state.controls).find(key => (state.controls as any)[key] !== (state.simulationState.controls as any)[key]) || 'unknown') as keyof ControlsState // Identify changed control
      );

      setAppState((prevState) => ({
        ...prevState,
        simulationState: {
          ...simulationResult,
          recommendations: [narration], // Add narration as a recommendation
        },
        narration: narration, // Set narration state
        isSimulating: false,
      }));
    } catch (error) {
      console.error('Error during simulation:', error);
      setAppState((prevState) => ({ ...prevState, isSimulating: false }));
      // Optionally, set an error state or show a user-friendly message
    }
  }, [state.canvasNodes, state.canvasEdges, state.controls, state.simulationState]);

  // Canvas auto-save hook
  const exportService = new ExportService();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaving(true);
    const handler = setTimeout(() => {
      const markdownSpec = exportService.exportAsMarkdown(state);
      console.log('Auto-saved markdown spec:', markdownSpec);
      // In a real app, you'd send this to a backend or save to local storage
      setIsSaving(false);
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(handler);
  }, [state.canvasNodes, state.canvasEdges, state.userInput, state.components, state.simulationState]);

  return (
    <AppStateContext.Provider
      value={{
        state,
        setAppState,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeDrop,
        setComponents,
        setSimulationState,
        setCurrentStep,
        onControlChange,
        onPlaySimulation,
        onToggleShowMath, // New
        getCalculationDetails: simulationService.getCalculationDetails, // New
        narration: state.narration, // New
        isSaving: isSaving, // New
        chatbotMessages: state.chatbotMessages, // New
        isChatbotResponding: state.isChatbotResponding, // New
        onSendChatbotMessage: onSendChatbotMessage, // New
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
