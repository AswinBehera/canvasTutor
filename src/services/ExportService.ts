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

  exportAsMarkdown(appState: AppState): string {
    let markdown = `# System Design Specification

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
    markdown += "```json\n";
    markdown += `${JSON.stringify(appState.canvasNodes, null, 2)}\n`;
    markdown += "```\n\n";
    markdown += `### Edges\n\n`;
    markdown += "```json\n";
    markdown += `${JSON.stringify(appState.canvasEdges, null, 2)}\n`;
    markdown += "```\n\n";

    markdown += `## Simulation Results

`;
    markdown += `### Controls\n\n`;
    markdown += "```json\n";
    markdown += `${JSON.stringify(appState.controls, null, 2)}\n`;
    markdown += "```\n\n";
    markdown += `### System Metrics

`;
    markdown += `- **Total Cost**: ${appState.simulationState.systemMetrics.totalCost}
`;
    markdown += `- **Average Response Time**: ${appState.simulationState.systemMetrics.averageResponseTime}
`;
    markdown += `- **Reliability**: ${appState.simulationState.systemMetrics.reliability}

`;

    if (appState.simulationState.recommendations && appState.simulationState.recommendations.length > 0) {
      markdown += `### Recommendations

`;
      appState.simulationState.recommendations.forEach((rec) => {
        markdown += `- ${rec}
`;
      });
    }

    markdown += `
### Node Metrics

`;
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

    markdown += `## User Stories (Derived from Canvas Design)

`;
    // Generate user stories based on components and connections
    if (appState.canvasNodes.length > 0) {
      appState.canvasNodes.forEach(node => {
        const component = appState.components.find(c => c.id === node.id.split('-')[0]); // Assuming ID format
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
