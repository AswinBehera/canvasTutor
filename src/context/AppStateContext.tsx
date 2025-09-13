import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { AppState, ComponentCard, SimulationState, ThresholdComponentsResponse, CustomNodeData, ControlsState } from '@/types';
import type { Node, Edge } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { componentsToNodes, getLayoutedElements, ensureConnected } from '@/lib/utils'; // Import getLayoutedElements and ensureConnected
import { SimulationService } from '../services/SimulationService';
import { ExportService } from '../services/ExportService'; // Import ExportService
import { CostEstimatorService } from '../services/CostEstimatorService'; // Import CostEstimatorService
import { ComponentExtractorService } from '../services/ComponentExtractorService'; // Import ComponentExtractorService
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
  onControlChange: (key: keyof ControlsState, value: number) => void;
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
  TRAFFIC_THRESHOLDS: number[]; // Expose traffic thresholds
  onSetChatInput: (input: string) => void; // New: Function to set chat input field
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
        },
      },
      controls: {
        traffic: 1, // Least possible traffic
      },
      isSimulating: false,
      showMath: false,
      isSaving: false,
      chatbotMessages: [],
      isChatbotResponding: false,
      totalCost: 0,
      costBreakdown: {},
      exportedMarkdownContent: '',
      thresholdComponents: {}, // Initialize threshold components
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

  const TRAFFIC_THRESHOLDS = [1000, 10000, 100000, 500000, 1000000]; // Define traffic thresholds

  // Fetch threshold components on initial load
  useEffect(() => {
    const fetchThresholdData = async () => {
      const extractor = new ComponentExtractorService();
      try {
        const data = await extractor.getThresholdComponents(TRAFFIC_THRESHOLDS);
        setAppState((prevState) => ({ ...prevState, thresholdComponents: data }));
      } catch (error) {
        console.error('Error fetching threshold components:', error);
      }
    };
    fetchThresholdData();
  }, []); // Run only once on mount

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

  const onTrafficThresholdChange = useCallback(
    (oldTraffic: number, newTraffic: number, currentNodes: Node<CustomNodeData>[], currentEdges: Edge[]) => {
      console.log(`onTrafficThresholdChange: oldTraffic=${oldTraffic}, newTraffic=${newTraffic}`);
      let nodes = [...currentNodes];
      let edges = [...currentEdges];

      // Helper to check if a node exists
      const nodeExists = (id: string) => nodes.some(node => node.id === id);

      // Iterate through thresholds to add/remove components
      TRAFFIC_THRESHOLDS.forEach(threshold => {
        const thresholdKey = String(threshold);
        const thresholdData = state.thresholdComponents[thresholdKey];

        if (!thresholdData) return; // Skip if no data for this threshold

        if (newTraffic >= threshold && oldTraffic < threshold) {
          // Traffic crossed threshold upwards: add components
          console.log(`Adding components for threshold: ${threshold}`);
          thresholdData.nodes.forEach(newNodeData => {
            if (!nodeExists(newNodeData.id)) {
              nodes.push({ ...newNodeData, type: 'custom', position: { x: 0, y: 0 }, data: { ...newNodeData, baseMetrics: newNodeData.baseMetrics || { responsiveness: 0, cost: 0, reliability: 0 }, scalingFactors: newNodeData.scalingFactors || { traffic: 0, instances: 0 } } }); // Add with default position and data
            }
          });
          thresholdData.edges.forEach(newEdgeData => {
            if (!edges.some(e => e.id === newEdgeData.id)) {
              edges.push({ ...newEdgeData, type: 'animated' });
            }
          });
        } else if (newTraffic < threshold && oldTraffic >= threshold) {
          // Traffic crossed threshold downwards: remove components
          console.log(`Removing components for threshold: ${threshold}`);
          thresholdData.nodes.forEach(nodeToRemove => {
            nodes = nodes.filter(n => n.id !== nodeToRemove.id);
            edges = edges.filter(e => e.source !== nodeToRemove.id && e.target !== nodeToRemove.id);
          });
          thresholdData.edges.forEach(edgeToRemove => {
            edges = edges.filter(e => e.id !== edgeToRemove.id);
          });
        }
      });

      console.log('New nodes after threshold change:', nodes);
      console.log('New edges after threshold change:', edges);

      // Ensure all nodes are connected
      const connectedEdges = ensureConnected(nodes, edges);

      // Update the state with the new nodes and edges
      const { layoutedNodes, layoutedEdges } = getLayoutedElements(nodes, connectedEdges);
      setAppState((prevState) => ({
        ...prevState,
        canvasNodes: layoutedNodes,
        canvasEdges: layoutedEdges,
      }));
    },
    [setAppState, state.thresholdComponents],
  );

  const onControlChange = useCallback(
    (key: 'traffic', value: number) => {
      setAppState((prevState) => {
        const newControls = { ...prevState.controls, [key]: value };
        console.log(`onControlChange: oldTraffic=${prevState.controls.traffic}, newTraffic=${value}`);
        // Call the new traffic threshold change handler
        onTrafficThresholdChange(prevState.controls.traffic, value, prevState.canvasNodes, prevState.canvasEdges);
        return {
          ...prevState,
          controls: newControls,
        };
      });
    },
    [onTrafficThresholdChange],
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
      const graphContext = `Current Graph Nodes: ${JSON.stringify(state.canvasNodes.map(node => ({ id: node.id, label: node.data.label, category: node.data.category })))} Current Graph Edges: ${JSON.stringify(state.canvasEdges.map(edge => ({ id: edge.id, source: edge.source, target: edge.target })))}`;

      const response = await chatbotService.getWillyWonkaResponse([
        { role: 'system', content: `The user's current system design problem is: ${state.userInput}` },
        { role: 'system', content: graphContext }, // Add graph context here
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
  }, [state.chatbotMessages, state.userInput, state.components, state.canvasNodes, state.canvasEdges, chatbotService]);

  const onSendAdaMessage = useCallback(async (message: string) => {
    const formattedMessage = formatUserInputForAda(state.userInput);
    setAppState((prevState) => ({
      ...prevState,
      chatbotMessages: [...prevState.chatbotMessages, { role: 'assistant', content: formattedMessage }],
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
  }, [state.userInput]);

  // Helper function to format user input for Ada's initial message
  const formatUserInputForAda = (input: string) => {
    try {
      const parsedInput = JSON.parse(input);
      let parts: string[] = [];

      if (parsedInput.description) {
        parts.push(`a system for ${parsedInput.description}`);
      }
      if (parsedInput.goal) {
        parts.push(`with the primary goal of ${parsedInput.goal}`);
      }
      if (parsedInput.features) {
        parts.push(`incorporating features such as ${parsedInput.features}`);
      }
      if (parsedInput.techPreferences) {
        parts.push(`and a preference for ${parsedInput.techPreferences} technologies`);
      }

      let formattedMessage = "";
      if (parts.length > 0) {
        formattedMessage = `Welcome! Based on your request to build ${parts.join(", ")}, this canvas is ready for you to design and simulate.`;
      } else {
        formattedMessage = "Welcome! This canvas is ready for you to design and simulate your system architecture.";
      }

      formattedMessage += " You can adjust controls to see their impact, and I am here to help you explore and optimize your design.";

      return formattedMessage;
    } catch (e) {
      console.error("Failed to parse user input for Ada chat:", e);
      return "Welcome! This canvas is ready for you to design and simulate your system architecture. You can adjust controls to see their impact, and I am here to help you explore and optimize your design.";
    }
  };

  const onPlaySimulation = useCallback(async () => {
    console.log('onPlaySimulation called');
    // Toggle the simulation state immediately
    setAppState((prevState) => {
      const newIsSimulating = !prevState.isSimulating;
      console.log(`Setting isSimulating to: ${newIsSimulating}`);
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
        console.log('Simulation completed. isSimulating set to false.');
      } catch (error) {
        console.error('Error during simulation:', error);
        setAppState((prevState) => ({ ...prevState, isSimulating: false }));
        console.log('Simulation error. isSimulating set to false.');
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
        TRAFFIC_THRESHOLDS: TRAFFIC_THRESHOLDS, // Expose traffic thresholds
        onSetChatInput: setUserInput, // Expose setUserInput as onSetChatInput
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