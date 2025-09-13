import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ComponentCard } from '@/types';
import type { Node, Edge } from '@xyflow/react';
import type { CustomNodeData } from '@/types';
import dagre from 'dagre';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const componentsToNodes = (components: ComponentCard[]): Node<CustomNodeData>[] => {
  return components.map((component) => ({
    id: component.id,
    type: 'custom', // Assuming you have a 'custom' node type for your components
    position: { x: 0, y: 0 }, // Position will be set by layout algorithm
    data: { label: component.label, description: component.description, category: component.category, techOptions: component.techOptions, baseMetrics: component.baseMetrics || { responsiveness: 0, cost: 0, reliability: 0 }, scalingFactors: component.scalingFactors || { traffic: 0, instances: 0 } },
  }));
};

const g = new dagre.graphlib.Graph();
g.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172; // Approximate width of your custom node
const nodeHeight = 100; // Approximate height of your custom node

export const getLayoutedElements = (nodes: Node<CustomNodeData>[], edges: Edge[], direction = 'LR') => {
  g.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2 - 100,
    };

    return node;
  });
  console.log('Layouted Nodes Y positions:', layoutedNodes.map(node => node.position.y)); // Added console.log

  return { layoutedNodes, layoutedEdges: edges };
};

export const ensureConnected = (nodes: Node<CustomNodeData>[], edges: Edge[]): Edge[] => {
  let newEdges = [...edges];

  const hasIncomingEdge = (nodeId: string, currentEdges: Edge[]) => currentEdges.some(edge => edge.target === nodeId);
  const hasOutgoingEdge = (nodeId: string, currentEdges: Edge[]) => currentEdges.some(edge => edge.source === nodeId);
  const edgeExists = (source: string, target: string, currentEdges: Edge[]) => currentEdges.some(edge => edge.source === source && edge.target === target);

  nodes.forEach(node => {
    const isSourceNode = node.data.category === 'frontend';
    const isSinkNode = node.data.category === 'logging';

    // Ensure incoming connections
    if (!isSourceNode && !hasIncomingEdge(node.id, newEdges)) {
      console.log(`Node ${node.id} (${node.data.label}) is missing incoming edge.`);
      const potentialSources = nodes.filter(n =>
        n.id !== node.id && hasOutgoingEdge(n.id, newEdges) // Must have outgoing edge to connect from
      );

      let connected = false;

      // Heuristic 1: Connect from Load Balancer to Backend/Frontend
      if (node.data.category === 'backend' || node.data.category === 'frontend') {
        const loadBalancer = potentialSources.find(n => n.data.category === 'network' && n.data.label === 'Load Balancer');
        if (loadBalancer && !edgeExists(loadBalancer.id, node.id, newEdges)) {
          newEdges.push({ id: `e-${loadBalancer.id}-${node.id}`, source: loadBalancer.id, target: node.id, type: 'animated' });
          console.log(`  Connected ${loadBalancer.id} to ${node.id} (Load Balancer heuristic)`);
          connected = true;
        }
      }

      // Heuristic 2: Connect from Frontend to Backend
      if (!connected && node.data.category === 'backend') {
        const frontend = potentialSources.find(n => n.data.category === 'frontend');
        if (frontend && !edgeExists(frontend.id, node.id, newEdges)) {
          newEdges.push({ id: `e-${frontend.id}-${node.id}`, source: frontend.id, target: node.id, type: 'animated' });
          console.log(`  Connected ${frontend.id} to ${node.id} (Frontend heuristic)`);
          connected = true;
        }
      }

      // Heuristic 3: Connect from Backend to Database/Storage/Messaging
      if (!connected && (node.data.category === 'database' || node.data.category === 'storage' || node.data.category === 'messaging')) {
        const backend = potentialSources.find(n => n.data.category === 'backend');
        if (backend && !edgeExists(backend.id, node.id, newEdges)) {
          newEdges.push({ id: `e-${backend.id}-${node.id}`, source: backend.id, target: node.id, type: 'animated' });
          console.log(`  Connected ${backend.id} to ${node.id} (Backend heuristic)`);
          connected = true;
        }
      }

      // Fallback: Connect from any available source to ensure connectivity
      if (!connected && potentialSources.length > 0) {
        const sourceNode = potentialSources[0];
        if (!edgeExists(sourceNode.id, node.id, newEdges)) {
          newEdges.push({ id: `e-${sourceNode.id}-${node.id}`, source: sourceNode.id, target: node.id, type: 'animated' });
          console.log(`  Connected ${sourceNode.id} to ${node.id} (fallback incoming)`);
        }
      }
    }

    // Ensure outgoing connections
    if (!isSinkNode && !hasOutgoingEdge(node.id, newEdges)) {
      console.log(`Node ${node.id} (${node.data.label}) is missing outgoing edge.`);
      const potentialSinks = nodes.filter(n =>
        n.id !== node.id && hasIncomingEdge(n.id, newEdges) // Must have incoming edge to connect to
      );

      let connected = false;

      // Heuristic 1: Connect from Frontend/Load Balancer to Backend
      if (node.data.category === 'frontend' || node.data.category === 'network') {
        const backend = potentialSinks.find(n => n.data.category === 'backend');
        if (backend && !edgeExists(node.id, backend.id, newEdges)) {
          newEdges.push({ id: `e-${node.id}-${backend.id}`, source: node.id, target: backend.id, type: 'animated' });
          console.log(`  Connected ${node.id} to ${backend.id} (Backend heuristic)`);
          connected = true;
        }
      }

      // Heuristic 2: Connect from Backend to Database/Storage/Messaging/Logging
      if (!connected && node.data.category === 'backend') {
        const database = potentialSinks.find(n => n.data.category === 'database');
        const messageQueue = potentialSinks.find(n => n.data.category === 'messaging');
        const logging = potentialSinks.find(n => n.data.category === 'logging');

        if (database && !edgeExists(node.id, database.id, newEdges)) {
          newEdges.push({ id: `e-${node.id}-${database.id}`, source: node.id, target: database.id, type: 'animated' });
          console.log(`  Connected ${node.id} to ${database.id} (Database heuristic)`);
          connected = true;
        } else if (messageQueue && !edgeExists(node.id, messageQueue.id, newEdges)) {
          newEdges.push({ id: `e-${node.id}-${messageQueue.id}`, source: node.id, target: messageQueue.id, type: 'animated' });
          console.log(`  Connected ${node.id} to ${messageQueue.id} (Message Queue heuristic)`);
          connected = true;
        } else if (logging && !edgeExists(node.id, logging.id, newEdges)) {
          newEdges.push({ id: `e-${node.id}-${logging.id}`, source: node.id, target: logging.id, type: 'animated' });
          console.log(`  Connected ${node.id} to ${logging.id} (Logging heuristic)`);
          connected = true;
        }
      }

      // Fallback: Connect to any available sink to ensure connectivity
      if (!connected && potentialSinks.length > 0) {
        const sinkNode = potentialSinks[0];
        if (!edgeExists(node.id, sinkNode.id, newEdges)) {
          newEdges.push({ id: `e-${node.id}-${sinkNode.id}`, source: node.id, target: sinkNode.id, type: 'animated' });
          console.log(`  Connected ${node.id} to ${sinkNode.id} (fallback outgoing)`);
        }
      }
    }
  });

  return newEdges;
};
