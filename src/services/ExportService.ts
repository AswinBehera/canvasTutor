import type { AppState } from '@/types';

export class ExportService {
  exportAsJson(appState: AppState): string {
    const exportData = {
      userInput: appState.userInput,
      components: appState.components,
      canvas: {
        nodes: appState.canvasNodes,
        edges: appState.canvasEdges,
      },
      simulation: {
        controls: appState.controls,
        results: appState.simulationState,
      },
    };
    return JSON.stringify(exportData, null, 2);
  }

  generateSpecMarkdown(appState: AppState): string {
    let markdown = `# System Design Specification

## Overview

This document outlines the design and implementation details of a system architecture, generated using CanvasTutor.

## Tech Stack

*   **Frontend:** React, TypeScript, Vite
*   **UI Components:** shadcn/ui, Tailwind CSS
*   **Canvas:** React Flow

## Design Details

This section provides a detailed breakdown of the system's components, their interactions, and simulation parameters.

`;
    markdown += `## User Input

${appState.userInput}

`;
    markdown += `## Components

`;
    appState.components.forEach((component) => {
      markdown += `- **${component.label}**: ${component.description}
`;
      if (component.baseMetrics) {
        markdown += `  - **Base Metrics**: Responsiveness: ${component.baseMetrics.responsiveness}, Cost: ${component.baseMetrics.cost}, Reliability: ${component.baseMetrics.reliability}
`;
      }
      if (component.scalingFactors) {
        markdown += `  - **Scaling Factors**: Traffic: ${component.scalingFactors.traffic}, Instances: ${component.scalingFactors.instances}
`;
      }
      markdown += `  - **Tech Options**: ${component.techOptions.join(', ')}
`;
      markdown += `  - **Category**: ${component.category}
`;
    });

    markdown += `
## Canvas Design

`;
    markdown += `### Nodes\n\n`;
    markdown += `### Edges\n\n`;
    markdown += `## Simulation Results\n\n`;
    markdown += `### Controls\n\n`;
    markdown += `- **Total Cost**: ${appState.simulationState.systemMetrics.totalCost}
`;
    markdown += `- **Average Response Time**: ${appState.simulationState.systemMetrics.averageResponseTime}
`;
    markdown += `- **Reliability**: ${appState.simulationState.systemMetrics.reliability}

`;

    if (appState.simulationState.recommendations && appState.simulationState.recommendations.length > 0) {
      markdown += `### Recommendations\n\n`;
      appState.simulationState.recommendations.forEach((rec) => {
        markdown += `- ${rec}
`;
      });
    }

    markdown += `
### Node Metrics\n\n`;
    appState.simulationState.nodeMetrics.forEach((metrics, nodeId) => {
      markdown += `#### Node: ${nodeId}
`;
      markdown += `- Responsiveness: ${metrics.responsiveness}
`;
      markdown += `- Traffic: ${metrics.traffic}
`;
      markdown += `- Cost: ${metrics.cost}
`;
      markdown += `- Reliability: ${metrics.reliability}

`;
    });

    markdown += `## User Stories (Derived from Canvas Design)\n\n`;
    if (appState.canvasNodes.length > 0) {
      appState.canvasNodes.forEach(node => {
        const component = appState.components.find(c => c.id === node.id.split('-')[0]); 
        if (component) {
          markdown += `- As a **user**, I want to **${component.description.toLowerCase()}** using the **${component.label}** component, so that I can achieve **${appState.userInput.split('/')[0] || 'my goal'}**.
`;
        }
      });
      appState.canvasEdges.forEach(edge => {
        const sourceNode = appState.canvasNodes.find(n => n.id === edge.source);
        const targetNode = appState.canvasNodes.find(n => n.id === edge.target);
        if (sourceNode && targetNode) {
          markdown += `- As a **system**, I need data to flow from **${(sourceNode.data as any).label}** to **${(targetNode.data as any).label}**, to enable seamless **${appState.userInput.split('/')[0] || 'data processing'}**.
`;
        }
      });
    } else {
      markdown += `No nodes or edges on the canvas to generate user stories from.`;
    }

    return markdown;
  }
}
