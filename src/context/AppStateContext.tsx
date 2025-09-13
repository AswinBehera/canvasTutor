import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppState, ComponentCard, SimulationState, Session } from '@/types';
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
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeDrop: (component: ComponentCard, position: { x: number; y: number }) => void;
  // Other actions
  setComponents: (components: ComponentCard[], initialEdges?: Edge[], confidence?: number, suggestions?: string[]) => void;
    setSimulationState: (simulationState: SimulationState) => void;
  setCurrentStep: (step: AppState['currentStep']) => void;
  onControlChange: (key: keyof ControlsState, value: any) => void;
  onPlaySimulation: () => void;
  onToggleShowMath: (show: boolean) => void; // New
  getCalculationDetails: (node: Node<CustomNodeData>, incomingTraffic: number, controls: ControlsState) => { formulas: string[]; breakdown: string[]; }; // New
  isSaving: boolean; // New
  chatbotMessages: { role: 'user' | 'assistant'; content: string }[]; // New
  isChatbotResponding: boolean; // New
  onSendChatbotMessage: (message: string) => Promise<void>; // New
  onSendAdaMessage: (message: string) => Promise<void>; // New: For Ada's initial message
  setUserInput: (input: string) => void; // New
  totalCost: number; // New
  costBreakdown: { [nodeId: string]: number }; // New
  sessions: Session[]; // New
  currentSessionId: string | null; // New
  saveCurrentSession: (sessionName: string) => void; // New
  loadSession: (sessionId: string) => void; // New
  createNewSession: () => void; // New
  deleteSession: (sessionId: string) => void; // New
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
      sessions: [],
      currentSessionId: null,
    };
  });

  const simulationService = new SimulationService();
  const costEstimatorService = new CostEstimatorService();

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
    (key: keyof ControlsState, value: any) => {
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

  const chatbotService = new ChatbotService();

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
  }, [state.chatbotMessages, state.userInput, state.components]);

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
    setAppState((prevState) => {
      const newIsSimulating = !prevState.isSimulating; // Toggle the state
      if (newIsSimulating) {
        // Start simulation
        return { ...prevState, isSimulating: true };
      } else {
        // Stop simulation
        return { ...prevState, isSimulating: false };
      }
    });

    if (!state.isSimulating) { // Only run simulation logic if starting
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
  }, [state.canvasNodes, state.canvasEdges, state.controls, state.isSimulating]); // Added state.isSimulating to dependencies

  const saveCurrentSession = useCallback((sessionName: string) => {
    setAppState((prevState) => {
      const newSession: Session = {
        id: prevState.currentSessionId || Date.now().toString(),
        name: sessionName,
        timestamp: Date.now(),
        state: prevState, // Save the entire current state
      };

      const existingSessionIndex = prevState.sessions.findIndex(s => s.id === newSession.id);
      let updatedSessions;
      if (existingSessionIndex > -1) {
        updatedSessions = prevState.sessions.map((s, index) =>
          index === existingSessionIndex ? newSession : s
        );
      } else {
        updatedSessions = [...prevState.sessions, newSession];
      }

      localStorage.setItem('canvasTutorSessions', JSON.stringify(updatedSessions));

      return {
        ...prevState,
        sessions: updatedSessions,
        currentSessionId: newSession.id,
      };
    });
  }, []);

  const loadSession = useCallback((sessionId: string) => {
    setAppState((prevState) => {
      const sessionToLoad = prevState.sessions.find(s => s.id === sessionId);
      if (sessionToLoad) {
        // When loading, we replace the entire state with the saved state
        // Ensure React Flow nodes/edges are correctly re-initialized if needed
        return {
          ...sessionToLoad.state,
          currentSessionId: sessionToLoad.id,
          sessions: prevState.sessions, // Keep the list of sessions intact
        };
      }
      return prevState;
    });
  }, []);

  const createNewSession = useCallback(() => {
    setAppState((prevState) => ({
      ...initialAppState, // Reset to a clean initial state
      sessions: prevState.sessions, // Keep existing sessions
      currentSessionId: null, // No current session until saved
    }));
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setAppState((prevState) => {
      const updatedSessions = prevState.sessions.filter(s => s.id !== sessionId);
      localStorage.setItem('canvasTutorSessions', JSON.stringify(updatedSessions));
      return {
        ...prevState,
        sessions: updatedSessions,
        currentSessionId: prevState.currentSessionId === sessionId ? null : prevState.currentSessionId, // Clear if current session deleted
      };
    });
  }, []);

  // Load all sessions from localStorage on initial render
  useEffect(() => {
    const savedSessions = localStorage.getItem('canvasTutorSessions');
    if (savedSessions) {
      const parsedSessions: Session[] = JSON.parse(savedSessions);
      setAppState((prevState) => ({
        ...prevState,
        sessions: parsedSessions,
        // Optionally load the last active session or keep currentSessionId null
      }));
    }
  }, []);

  // Save current session state to localStorage whenever relevant parts of the state change
  useEffect(() => {
    if (state.currentSessionId) {
      const currentSessionData: Session = {
        id: state.currentSessionId,
        name: state.sessions.find(s => s.id === state.currentSessionId)?.name || 'Unnamed Session',
        timestamp: Date.now(),
        state: state, // Save the entire current state
      };
      const updatedSessions = state.sessions.map(s =>
        s.id === state.currentSessionId ? currentSessionData : s
      );
      localStorage.setItem('canvasTutorSessions', JSON.stringify(updatedSessions));
    }
  }, [state.currentSessionId, state.userInput, state.components, state.canvasNodes, state.canvasEdges, state.simulationState, state.controls, state.chatbotMessages, state.totalCost, state.costBreakdown]);

  // Canvas auto-save hook (modified to use session saving)
  const exportService = new ExportService();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaving(true);
    const handler = setTimeout(() => {
      if (state.currentSessionId) {
        saveCurrentSession(state.sessions.find(s => s.id === state.currentSessionId)?.name || 'Unnamed Session');
      } else {
        // If no current session, auto-save to a temporary session or prompt to save
        console.log('No current session to auto-save to.');
      }
      setIsSaving(false);
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(handler);
  }, [state.canvasNodes, state.canvasEdges, state.userInput, state.components, state.simulationState, state.currentSessionId, saveCurrentSession]);

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
        isSaving: isSaving,
        chatbotMessages: state.chatbotMessages,
        isChatbotResponding: state.isChatbotResponding,
                onSendChatbotMessage: onSendChatbotMessage, // New
        onSendAdaMessage: onSendAdaMessage, // New
        setUserInput: setUserInput, // New
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        saveCurrentSession: saveCurrentSession,
        loadSession: loadSession,
        createNewSession: createNewSession,
        deleteSession: deleteSession,
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