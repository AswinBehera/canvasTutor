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
