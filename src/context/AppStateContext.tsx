import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { AppState, ComponentCard, SimulationState, ThresholdComponentsResponse, CustomNodeData, ControlsState } from '@/types';
import type { Node, Edge } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { componentsToNodes, getLayoutedElements, ensureConnected } from '@/lib/utils';
import { SimulationService } from '../services/SimulationService';
import { ExportService } from '../services/ExportService';
import { CostEstimatorService } from '../services/CostEstimatorService';
import { ComponentExtractorService } from '../services/ComponentExtractorService';
import { ChatbotService } from '../services/ChatbotService';

/**
 * Defines the shape of the context API, exposing the application state
 * and various functions to interact with and modify that state.
 */
interface AppStateContextType {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  // Canvas related actions for React Flow integration
  onNodesChange: (changes: import('@xyflow/react').NodeChange[]) => void;
  onEdgesChange: (changes: import('@xyflow/react').EdgeChange[]) => void;
  onConnect: (connection: import('@xyflow/react').Connection) => void;
  onNodeDrop: (component: ComponentCard, position: { x: number; y: number }) => void;
  // Other core application actions
  setComponents: (components: ComponentCard[], initialEdges?: Edge[]) => void;
  setSimulationState: (simulationState: SimulationState) => void;
  setCurrentStep: (step: AppState['currentStep']) => void;
  onControlChange: (key: keyof ControlsState, value: number) => void;
  onPlaySimulation: () => void;
  onToggleShowMath: (show: boolean) => void;
  getCalculationDetails: (node: Node<CustomNodeData>, incomingTraffic: number, controls: ControlsState) => { formulas: string[]; breakdown: string[]; };
  // Chatbot related state and actions
  chatbotMessages: { role: 'user' | 'assistant'; content: string }[];
  isChatbotResponding: boolean;
  onSendChatbotMessage: (message: string) => Promise<void>;
  onSendAdaMessage: (message: string) => Promise<void>;
  onSetChatInput: (input: string) => void; // For setting the chat input field externally
  // User input and export related state
  setUserInput: (input: string) => void;
  exportedMarkdownContent: string;
  onGenerateExportMarkdown: () => void;
  // Simulation metrics and thresholds
  totalCost: number;
  costBreakdown: { [nodeId: string]: number };
  TRAFFIC_THRESHOLDS: number[];
}

// Create the React Context with an initial undefined value.
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

/**
 * AppStateProvider is a React component that manages the global application state.
 * It uses React's Context API to make the state and state-modifying functions
 * available to all descendant components without prop drilling.
 */
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize the application state using useState.
  // The state includes various aspects like current step, user input, canvas elements,
  // simulation results, chatbot messages, and cost metrics.
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
          traffic: 1, // Default least possible traffic
        },
      },
      controls: {
        traffic: 1, // Default least possible traffic
      },
      isSimulating: false,
      showMath: false,
      isSaving: false,
      chatbotMessages: [],
      isChatbotResponding: false,
      totalCost: 0,
      costBreakdown: {},
      exportedMarkdownContent: '',
      thresholdComponents: {}, // Stores components dynamically added/removed based on traffic thresholds
    };
  });

  // Memoize service instances to prevent unnecessary re-instantiations on re-renders.
  const simulationService = useMemo(() => new SimulationService(), []);
  const costEstimatorService = useMemo(() => new CostEstimatorService(), []);
  const chatbotService = useMemo(() => new ChatbotService(), []);
  // ExportService is also memoized as it's used in onGenerateExportMarkdown
  const exportService = useMemo(() => new ExportService(), []);

  /**
   * Callback for handling changes to React Flow nodes (e.g., position, selection).
   * Uses `applyNodeChanges` from `@xyflow/react` to efficiently update node state.
   */
  const onNodesChange = useCallback(
    (changes: import('@xyflow/react').NodeChange[]) => {
      setAppState((prevState) => ({
        ...prevState,
        canvasNodes: applyNodeChanges(changes, prevState.canvasNodes) as Node<CustomNodeData>[],
      }));
    },
    [], // No dependencies, as `setAppState` is stable.
  );

  /**
   * Callback for handling changes to React Flow edges (e.g., deletion).
   * Uses `applyEdgeChanges` from `@xyflow/react` to efficiently update edge state.
   */
  const onEdgesChange = useCallback(
    (changes: import('@xyflow/react').EdgeChange[]) => {
      setAppState((prevState) => ({
        ...prevState,
        canvasEdges: applyEdgeChanges(changes, prevState.canvasEdges) as Edge[],
      }));
    },
    [], // No dependencies, as `setAppState` is stable.
  );

  /**
   * Callback for handling new connections between nodes in React Flow.
   * Adds a new animated edge to the canvas.
   */
  const onConnect = useCallback(
    (connection: import('@xyflow/react').Connection) => {
      setAppState((prevState) => ({
        ...prevState,
        canvasEdges: addEdge({ ...connection, type: 'animated' }, prevState.canvasEdges),
      }));
    },
    [], // No dependencies, as `setAppState` is stable.
  );

  /**
   * Callback for when a component card is dropped onto the canvas.
   * Creates a new custom node from the component data and adds it to the canvas.
   */
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
    [], // No dependencies, as `setAppState` is stable.
  );

  /**
   * Sets the initial components and lays out the nodes and edges on the canvas.
   * This is typically called after extracting components from user input.
   * @param components Array of ComponentCard objects.
   * @param initialEdges Optional array of initial edges.
   */
  const setComponents = useCallback((components: ComponentCard[], initialEdges: Edge[] = []) => {
    console.log('setComponents called with initialEdges:', initialEdges);
    const newNodes = componentsToNodes(components);
    // Layout nodes and edges using a utility function to ensure a clean, readable graph.
    const { layoutedNodes, layoutedEdges } = getLayoutedElements(newNodes as Node<CustomNodeData>[], initialEdges);
    setAppState((prevState) => ({
      ...prevState,
      components,
      canvasNodes: layoutedNodes,
      canvasEdges: layoutedEdges,
    }));
  }, []);

  // Define traffic thresholds for dynamic component loading.
  const TRAFFIC_THRESHOLDS = [1000, 10000, 100000, 500000, 1000000];

  /**
   * Effect hook to fetch threshold-specific components on initial application load.
   * These components are dynamically added/removed based on traffic changes.
   */
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
  }, []); // Empty dependency array ensures this runs only once on mount.

  /**
   * Sets the simulation state, typically after a simulation run completes.
   * @param simulationState The new simulation state object.
   */
  const setSimulationState = useCallback((simulationState: SimulationState) => {
    setAppState((prevState) => ({
      ...prevState,
      simulationState: {
        ...simulationState,
        controls: prevState.controls, // Preserve controls from previous state
      },
    }));
  }, []);

  /**
   * Sets the current step of the application flow (e.g., 'input', 'canvas', 'simulation').
   * @param step The new step to transition to.
   */
  const setCurrentStep = useCallback((step: AppState['currentStep']) => {
    setAppState((prevState) => ({
      ...prevState,
      currentStep: step,
    }));
  }, []);

  /**
   * Sets the user input string, typically from the initial input prompt.
   * @param input The user's input string.
   */
  const setUserInput = useCallback((input: string) => {
    setAppState((prevState) => ({
      ...prevState,
      userInput: input,
    }));
  }, []);

  /**
   * Dynamically adds or removes components (nodes and edges) from the canvas
   * based on changes in traffic thresholds. This ensures the system architecture
   * adapts to different load levels.
   * @param oldTraffic The previous traffic value.
   * @param newTraffic The current (new) traffic value.
   * @param currentNodes The current array of nodes on the canvas.
   * @param currentEdges The current array of edges on the canvas.
   */
  const onTrafficThresholdChange = useCallback(
    (oldTraffic: number, newTraffic: number, currentNodes: Node<CustomNodeData>[], currentEdges: Edge[]) => {
      console.log(`onTrafficThresholdChange: oldTraffic=${oldTraffic}, newTraffic=${newTraffic}`);
      let nodes = [...currentNodes];
      let edges = [...currentEdges];

      // Helper to check if a node with a given ID already exists in the current nodes array.
      const nodeExists = (id: string) => nodes.some(node => node.id === id);

      // Iterate through predefined traffic thresholds.
      TRAFFIC_THRESHOLDS.forEach(threshold => {
        const thresholdKey = String(threshold);
        const thresholdData = state.thresholdComponents[thresholdKey];

        if (!thresholdData) return; // Skip if no specific components defined for this threshold.

        // Logic to add components when traffic crosses a threshold upwards.
        if (newTraffic >= threshold && oldTraffic < threshold) {
          console.log(`Adding components for threshold: ${threshold}`);
          thresholdData.nodes.forEach(newNodeData => {
            if (!nodeExists(newNodeData.id)) {
              // Add new node with default position and data, ensuring baseMetrics and scalingFactors are present.
              nodes.push({ ...newNodeData, type: 'custom', position: { x: 0, y: 0 }, data: { ...newNodeData, baseMetrics: newNodeData.baseMetrics || { responsiveness: 0, cost: 0, reliability: 0 }, scalingFactors: newNodeData.scalingFactors || { traffic: 0, instances: 0 } } });
            }
          });
          thresholdData.edges.forEach(newEdgeData => {
            // Add new edge if it doesn't already exist.
            if (!edges.some(e => e.id === newEdgeData.id)) {
              edges.push({ ...newEdgeData, type: 'animated' });
            }
          });
        } else if (newTraffic < threshold && oldTraffic >= threshold) {
          // Logic to remove components when traffic drops below a threshold.
          console.log(`Removing components for threshold: ${threshold}`);
          thresholdData.nodes.forEach(nodeToRemove => {
            // Filter out the node and any associated edges.
            nodes = nodes.filter(n => n.id !== nodeToRemove.id);
            edges = edges.filter(e => e.source !== nodeToRemove.id && e.target !== nodeToRemove.id);
          });
          thresholdData.edges.forEach(edgeToRemove => {
            // Filter out the edge.
            edges = edges.filter(e => e.id !== edgeToRemove.id);
          });
        }
      });

      console.log('New nodes after threshold change:', nodes);
      console.log('New edges after threshold change:', edges);

      // Ensure all remaining nodes are properly connected after additions/removals.
      const connectedEdges = ensureConnected(nodes, edges);

      // Re-layout the graph to maintain a clean visual representation.
      const { layoutedNodes, layoutedEdges } = getLayoutedElements(nodes, connectedEdges);
      setAppState((prevState) => ({
        ...prevState,
        canvasNodes: layoutedNodes,
        canvasEdges: layoutedEdges,
      }));
    },
    [setAppState, state.thresholdComponents], // Dependencies: `setAppState` for state updates, `state.thresholdComponents` for dynamic data.
  );

  /**
   * Handles changes to simulation controls (e.g., traffic level).
   * Triggers the `onTrafficThresholdChange` callback to update canvas components dynamically.
   * @param key The control key that changed (e.g., 'traffic').
   * @param value The new value of the control.
   */
  const onControlChange = useCallback(
    (key: 'traffic', value: number) => {
      setAppState((prevState) => {
        const newControls = { ...prevState.controls, [key]: value };
        console.log(`onControlChange: oldTraffic=${prevState.controls.traffic}, newTraffic=${value}`);
        // Call the traffic threshold change handler to update canvas based on new traffic.
        onTrafficThresholdChange(prevState.controls.traffic, value, prevState.canvasNodes, prevState.canvasEdges);
        return {
          ...prevState,
          controls: newControls,
        };
      });
    },
    [onTrafficThresholdChange], // Dependency: `onTrafficThresholdChange` callback.
  );

  /**
   * Toggles the display of mathematical formulas/breakdowns in the UI.
   * @param show Boolean indicating whether to show or hide math details.
   */
  const onToggleShowMath = useCallback((show: boolean) => {
    setAppState((prevState) => ({ ...prevState, showMath: show }));
  }, []);

  /**
   * Handles sending a message from the user to the chatbot (Ada).
   * Updates chat messages state and calls the chatbot service for a response.
   * Includes current graph context for more relevant AI responses.
   * @param message The user's message.
   */
  const onSendChatbotMessage = useCallback(async (message: string) => {
    setAppState((prevState) => ({
      ...prevState,
      chatbotMessages: [...prevState.chatbotMessages, { role: 'user', content: message }],
      isChatbotResponding: true, // Indicate that Ada is thinking
    }));

    try {
      // Construct graph context from current nodes and edges for the LLM.
      const graphContext = `Current Graph Nodes: ${JSON.stringify(state.canvasNodes.map(node => ({ id: node.id, label: node.data.label, category: node.data.category })))} Current Graph Edges: ${JSON.stringify(state.canvasEdges.map(edge => ({ id: edge.id, source: edge.source, target: edge.target })))}`;

      // Get response from chatbot service, providing system context and chat history.
      const response = await chatbotService.getWillyWonkaResponse([
        { role: 'system', content: `The user's current system design problem is: ${state.userInput}` },
        { role: 'system', content: graphContext },
        ...state.chatbotMessages,
        { role: 'user', content: message },
      ]);

      setAppState((prevState) => ({
        ...prevState,
        chatbotMessages: [...prevState.chatbotMessages, { role: 'assistant', content: response }],
        isChatbotResponding: false, // Ada has finished responding
      }));
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      setAppState((prevState) => ({
        ...prevState,
        chatbotMessages: [...prevState.chatbotMessages, { role: 'assistant', content: "Oh dear, it seems my chocolate river has encountered a slight blockage! Do try again, won't you?" }],
        isChatbotResponding: false,
      }));
    }
  }, [state.chatbotMessages, state.userInput, state.canvasNodes, state.canvasEdges, chatbotService]);

  /**
   * Handles sending Ada's initial welcome message based on user input.
   * Simulates a processing time before Ada's message appears.
   * @param message The initial message from Ada.
   */
  const onSendAdaMessage = useCallback(async (message: string) => {
    const formattedMessage = formatUserInputForAda(state.userInput);
    setAppState((prevState) => ({
      ...prevState,
      chatbotMessages: [...prevState.chatbotMessages, { role: 'assistant', content: formattedMessage }],
      isChatbotResponding: true, // Set to true while Ada is "thinking"
    }));

    try {
      // Simulate processing time for Ada's response.
      await new Promise(resolve => setTimeout(resolve, 500));

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

  /**
   * Helper function to format the user's initial input into a friendly welcome message for Ada.
   * @param input The raw user input string.
   * @returns A formatted welcome message.
   */
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

  /**
   * Initiates or stops the simulation process.
   * Calculates system metrics and costs based on current canvas and controls.
   */
  const onPlaySimulation = useCallback(async () => {
    console.log('onPlaySimulation called');
    // Toggle the simulation state immediately to provide quick UI feedback.
    setAppState((prevState) => {
      const newIsSimulating = !prevState.isSimulating;
      console.log(`Setting isSimulating to: ${newIsSimulating}`);
      return { ...prevState, isSimulating: newIsSimulating };
    });

    // Use a local variable to capture the *intended* new state for simulation logic.
    // This is crucial because state updates are asynchronous.
    const willSimulate = !state.isSimulating; // Captures the state *before* the setAppState above.

    if (willSimulate) { // Only run simulation logic if we intend to start simulating.
      try {
        // Calculate simulation metrics using the SimulationService.
        const simulationResult = await simulationService.calculateMetrics(
          state.canvasNodes as Node<CustomNodeData>[],
          state.canvasEdges,
          state.controls
        );

        // Estimate costs using the CostEstimatorService.
        const costEstimation = costEstimatorService.estimateCost(
          state.canvasNodes as Node<CustomNodeData>[],
          state.controls
        );

        setAppState((prevState) => ({
          ...prevState,
          simulationState: simulationResult,
          totalCost: costEstimation.totalCost,
          costBreakdown: costEstimation.breakdown,
          isSimulating: false, // Set to false after simulation completes.
        }));
        console.log('Simulation completed. isSimulating set to false.');
      } catch (error) {
        console.error('Error during simulation:', error);
        setAppState((prevState) => ({ ...prevState, isSimulating: false }));
        console.log('Simulation error. isSimulating set to false.');
        // Optionally, set an error state or show a user-friendly message to the user.
      }
    }
  }, [state.canvasNodes, state.canvasEdges, state.controls, state.isSimulating, costEstimatorService, simulationService]); // Dependencies for useCallback.

  /**
   * Triggers the generation of the export markdown content.
   * Updates the `exportedMarkdownContent` in the application state.
   */
  const onGenerateExportMarkdown = useCallback(() => {
    const markdown = exportService.generateSpecMarkdown(state);
    setAppState((prevState) => ({
      ...prevState,
      exportedMarkdownContent: markdown,
    }));
  }, [state, exportService]); // Depend on state to ensure latest data is used.

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
        onSendChatbotMessage,
        onSendAdaMessage,
        setUserInput,
        totalCost: state.totalCost,
        costBreakdown: state.costBreakdown,
        exportedMarkdownContent: state.exportedMarkdownContent,
        onGenerateExportMarkdown,
        TRAFFIC_THRESHOLDS,
        onSetChatInput: setUserInput, // Expose setUserInput as onSetChatInput
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

/**
 * Custom hook to consume the AppStateContext.
 * Throws an error if used outside of an AppStateProvider.
 * @returns The AppStateContextType object.
 */
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
