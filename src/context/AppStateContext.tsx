import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { AppState, ComponentCard, SimulationState } from '@/types';
import type { Node, Edge } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { componentsToNodes, getLayoutedElements } from '@/lib/utils'; // Import getLayoutedElements
import { SimulationService } from '../services/SimulationService';
import { ExportService } from '../services/ExportService'; // Import ExportService
import { CostEstimatorService } from '../services/CostEstimatorService'; // Import CostEstimatorService

import type { ControlsState, CustomNodeData } from '@/types'; // Import ControlsState, CustomNodeData

import { ChatbotService } from '../services/ChatbotService'; // Import ChatbotService

interface AppStateContextType {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  // Canvas related actions
  onNodesChange: (changes: import('@xyflow/react').NodeChange[]) => void;
  onEdgesChange: (changes: import('@xyflow/react').EdgeChange[]) => void;
  onConnect: (connection: import('@xyflow/react').Connection) => void;
  onNodeDrop: (component: ComponentCard, position: { x: number; y: number }) => void;
  // Other actions
  setComponents: (components: ComponentCard[], initialEdges?: Edge[]) => void;
    setSimulationState: (simulationState: SimulationState) => void;
  setCurrentStep: (step: AppState['currentStep']) => void;
  onControlChange: (key: keyof ControlsState, value: string | number) => void;
  onPlaySimulation: () => void;
  onToggleShowMath: (show: boolean) => void; // New
  getCalculationDetails: (node: Node<CustomNodeData>, incomingTraffic: number, controls: ControlsState) => { formulas: string[]; breakdown: string[]; }; // New
  chatbotMessages: { role: 'user' | 'assistant'; content: string }[]; // New
  isChatbotResponding: boolean; // New
  onSendChatbotMessage: (message: string) => Promise<void>; // New
  onSendAdaMessage: (message: string) => Promise<void>; // New: For Ada's initial message
  setUserInput: (input: string) => void; // New
  totalCost: number; // New
  costBreakdown: { [nodeId: string]: number }; // New
  exportedMarkdownContent: string; // New: Stores the generated markdown for export
  onGenerateExportMarkdown: () => void; // New: Function to trigger markdown generation
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setAppState] = useState<AppState>(() => {
    return {
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
        controls: {
          traffic: 1, // Least possible traffic
          instances: 1, // Least possible instances
          cache: 'off', // Assuming 'off' is least cost for cache
          vendor: 'diy', // DIY is generally cheaper
        },
      },
      controls: {
        traffic: 1, // Least possible traffic
        instances: 1, // Least possible instances
        cache: 'off', // Assuming 'off' is least cost for cache
        vendor: 'diy', // DIY is generally cheaper
      },
      isSimulating: false,
      showMath: false,
      isSaving: false,
      chatbotMessages: [],
      isChatbotResponding: false,
      totalCost: 0,
      costBreakdown: {},
      exportedMarkdownContent: '',
    };
  });

  const simulationService = useMemo(() => new SimulationService(), []);
  const costEstimatorService = useMemo(() => new CostEstimatorService(), []);

  const onNodesChange = useCallback(
    (changes: import('@xyflow/react').NodeChange[]) => {
      setAppState((prevState) => ({
        ...prevState,
        canvasNodes: applyNodeChanges(changes, prevState.canvasNodes) as Node<CustomNodeData>[],
      }));
    },
    [],
  );

  const onEdgesChange = useCallback(
    (changes: import('@xyflow/react').EdgeChange[]) => {
      setAppState((prevState) => ({
        ...prevState,
        canvasEdges: applyEdgeChanges(changes, prevState.canvasEdges) as Edge[],
      }));
    },
    [],
  );

  const onConnect = useCallback(
    (connection: import('@xyflow/react').Connection) => {
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
        id: component.id,
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
    const { layoutedNodes, layoutedEdges } = getLayoutedElements(newNodes as Node<CustomNodeData>[], initialEdges);
    setAppState((prevState) => ({
      ...prevState,
      components,
      canvasNodes: layoutedNodes,
      canvasEdges: layoutedEdges,
    }));
  }, []);

  const setSimulationState = useCallback((simulationState: SimulationState) => {
    setAppState((prevState) => ({
      ...prevState,
      simulationState: {
        ...simulationState,
        controls: prevState.controls,
      },
    }));
  }, []);

  const setCurrentStep = useCallback((step: AppState['currentStep']) => {
    setAppState((prevState) => ({
      ...prevState,
      currentStep: step,
    }));
  }, []);

  const setUserInput = useCallback((input: string) => {
    setAppState((prevState) => ({
      ...prevState,
      userInput: input,
    }));
  }, []);

  const onControlChange = useCallback(
    (key: keyof ControlsState, value: string | number) => {
      setAppState((prevState) => ({
        ...prevState,
        controls: {
          ...prevState.controls,
          [key]: value,
        },
      }));
    },
    [],
  );

  const onToggleShowMath = useCallback((show: boolean) => {
    setAppState((prevState) => ({ ...prevState, showMath: show }));
  }, []);

  const chatbotService = useMemo(() => new ChatbotService(), []);

  const onSendChatbotMessage = useCallback(async (message: string) => {
    setAppState((prevState) => ({
      ...prevState,
      chatbotMessages: [...prevState.chatbotMessages, { role: 'user', content: message }],
      isChatbotResponding: true,
    }));

    try {
      const response = await chatbotService.getWillyWonkaResponse([
        { role: 'system', content: `The user's current system design problem is: ${state.userInput}` },
        { role: 'system', content: `The current components are: ${JSON.stringify(state.components)}` },
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
  }, [state.chatbotMessages, state.userInput, state.components, chatbotService]);

  const onSendAdaMessage = useCallback(async (message: string) => {
    setAppState((prevState) => ({
      ...prevState,
      chatbotMessages: [...prevState.chatbotMessages, { role: 'assistant', content: message }],
      isChatbotResponding: true, // Set to true while Ada is "thinking"
    }));

    try {
      // Here, we're simulating Ada "thinking" or processing the request
      // In a real scenario, this might involve another LLM call or complex logic
      // For now, we'll just set isChatbotResponding to false after a short delay
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time

      setAppState((prevState) => ({
        ...prevState,
        isChatbotResponding: false, // Ada has finished "thinking"
      }));
    } catch (error) {
      console.error('Error sending Ada\'s initial message:', error);
      setAppState((prevState) => ({
        ...prevState,
        chatbotMessages: [...prevState.chatbotMessages, { role: 'assistant', content: "Oh dear, I seem to have misplaced my thoughts! Please try again." }],
        isChatbotResponding: false,
      }));
    }
  }, []);

  const onPlaySimulation = useCallback(async () => {
    // Toggle the simulation state immediately
    setAppState((prevState) => {
      const newIsSimulating = !prevState.isSimulating;
      return { ...prevState, isSimulating: newIsSimulating };
    });

    // Use a local variable to capture the *intended* new state for simulation logic
    // This is crucial because state updates are asynchronous
    const willSimulate = !state.isSimulating; // This captures the state *before* the setAppState above

    if (willSimulate) { // Only run simulation logic if we intend to start simulating
      try {
        const simulationResult = await simulationService.calculateMetrics(
          state.canvasNodes as Node<CustomNodeData>[],
          state.canvasEdges,
          state.controls
        );

        const costEstimation = costEstimatorService.estimateCost(
          state.canvasNodes as Node<CustomNodeData>[],
          state.controls
        );

        setAppState((prevState) => ({
          ...prevState,
          simulationState: simulationResult,
          totalCost: costEstimation.totalCost,
          costBreakdown: costEstimation.breakdown,
          isSimulating: false, // Set to false after simulation completes
        }));
      } catch (error) {
        console.error('Error during simulation:', error);
        setAppState((prevState) => ({ ...prevState, isSimulating: false }));
        // Optionally, set an error state or show a user-friendly message
      }
    }
  }, [state.canvasNodes, state.canvasEdges, state.controls, state.isSimulating, costEstimatorService, simulationService]); // Added state.isSimulating to dependencies

  const exportService = useMemo(() => new ExportService(), []);

  const onGenerateExportMarkdown = useCallback(() => {
    const markdown = exportService.generateSpecMarkdown(state);
    setAppState((prevState) => ({
      ...prevState,
      exportedMarkdownContent: markdown,
    }));
  }, [state, exportService]); // Depend on state to ensure latest data is used

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
        onToggleShowMath,
        getCalculationDetails: simulationService.getCalculationDetails,
        chatbotMessages: state.chatbotMessages,
        isChatbotResponding: state.isChatbotResponding,
                onSendChatbotMessage: onSendChatbotMessage, // New
        onSendAdaMessage: onSendAdaMessage, // New
        setUserInput: setUserInput, // New
        totalCost: state.totalCost,
        costBreakdown: state.costBreakdown,
        exportedMarkdownContent: state.exportedMarkdownContent, // Expose generated markdown
        onGenerateExportMarkdown: onGenerateExportMarkdown, // Expose markdown generation function
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