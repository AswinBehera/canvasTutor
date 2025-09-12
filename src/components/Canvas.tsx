import { useReactFlow, ReactFlow, Controls, Background } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import React, { useCallback, useEffect } from 'react';
import '@xyflow/react/dist/style.css'; // Import React Flow styles
import { useAppState } from '../context/AppStateContext';
import type { ComponentCard as ComponentCardType, CustomNodeData } from '@/types';
import { CustomNode } from './CustomNode';
import { AnimatedEdge } from './AnimatedEdge'; // Import AnimatedEdge

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  animated: AnimatedEdge, // Define animated edge type
};

type CanvasProps = {
  nodes: Node[];
  edges: any[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeDrop: (component: ComponentCardType, position: { x: number; y: number }) => void;
  showMath: boolean;
};

export function Canvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeDrop, showMath }: CanvasProps) {
  const { getCalculationDetails, state } = useAppState();
  const { controls } = state;
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      fitView({ padding: 1.0, includeHiddenNodes: true, duration: 0 });
    }
  }, [nodes.length, edges.length, fitView]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const componentString = event.dataTransfer.getData('application/reactflow');
      if (!componentString) {
        return;
      }
      const component = JSON.parse(componentString);

      const position = {
        x: event.clientX,
        y: event.clientY,
      };
      
      onNodeDrop(component, position);
    },
    [onNodeDrop]
  );

  return (
    <div style={{ height: '100%' }} onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        <Controls />
        <Background />
      </ReactFlow>
      {showMath && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'white', padding: 10, border: '1px solid black', zIndex: 100, maxHeight: '80%', overflowY: 'auto' }}>
          <h3>Simulation Math Details</h3>
          {nodes.filter(node => node.selected).map(node => {
            const nodeData = node.data as CustomNodeData;
            const { formulas, breakdown } = getCalculationDetails(node as Node<CustomNodeData>, controls.traffic, controls);
            return (
              <div key={node.id} className="mb-4">
                <h4>Node: {nodeData.label} ({node.id})</h4>
                <h5>Formulas:</h5>
                <ul>
                  {formulas.map((formula: string, index: number) => (
                    <li key={index}>{formula}</li>
                  ))}
                </ul>
                <h5>Breakdown:</h5>
                <ul>
                  {breakdown.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            );
          })}
          {nodes.filter(node => node.selected).length === 0 && (
            <p>Select a node on the canvas to see its calculation details.</p>
          )}
        </div>
      )}
    </div>
  );
}