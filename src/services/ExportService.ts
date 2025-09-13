import type { AppState } from '@/types';
import type { Node, Edge } from '@xyflow/react';
import type { CustomNodeData } from '@/types';

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
    const { userInput, canvasNodes, canvasEdges, simulationState } = appState;

    // Helper to format user input into a readable sentence
    const formatUserInput = (input: string) => {
      try {
        const parsedInput = JSON.parse(input);
        let parts: string[] = [];
        if (parsedInput.description) parts.push(`a system for **${parsedInput.description}**`);
        if (parsedInput.goal) parts.push(`with the primary goal of **${parsedInput.goal}**`);
        if (parsedInput.features) parts.push(`incorporating features such as **${parsedInput.features}**`);
        if (parsedInput.techPreferences) parts.push(`and a preference for **${parsedInput.techPreferences}** technologies`);
        return parts.length > 0 ? `The user intends to build ${parts.join(', ')}.` : "The user has provided input for a system design.";
      } catch (e) {
        return `The user provided the following input: "${input}".`;
      }
    };

    let markdown = `# System Design Specification\n\n`;

    // 1. Project Overview
    markdown += `## 1. Project Overview\n\n`;
    markdown += `This document outlines the design and implementation details of a system architecture, generated using CanvasTutor based on user requirements.\n\n`;
    markdown += `### User Requirements\n\n`;
    markdown += `${formatUserInput(userInput)}\n\n`;

    // 2. System Architecture
    markdown += `## 2. System Architecture\n\n`;
    markdown += `The system architecture is composed of various interconnected components designed to fulfill the specified requirements. This section details each component and their interactions.\n\n`;

    markdown += `### 2.1. Components (Nodes)\n\n`;
    if (canvasNodes.length > 0) {
      canvasNodes.forEach((node: Node<CustomNodeData>) => {
        const { id, data } = node;
        const { label, description, category, techOptions, baseMetrics, scalingFactors } = data;
        markdown += `#### ${label} (ID: acktick${id}acktick)\n\n`;
        markdown += `- **Description**: ${description}\n`;
        markdown += `- **Category**: ${category}\n`;
        markdown += `- **Base Metrics**:\n`;
        markdown += `  - Responsiveness: ${baseMetrics.responsiveness}\n`;
        markdown += `  - Cost: ${baseMetrics.cost}/month\n`;
        markdown += `  - Reliability: ${baseMetrics.reliability}\n`;
        markdown += `- **Scaling Factors**:\n`;
        markdown += `  - Traffic Impact: ${scalingFactors.traffic} (e.g., how much performance degrades with increased traffic)\n`;
        markdown += `  - Instance Impact: ${scalingFactors.instances} (e.g., how much performance improves with more instances)\n`;
        markdown += `- **Technology Options**:\n`;
        markdown += `  - **Managed Service**: ${techOptions[0]} (Recommended for ease of use, faster deployment)\n`;
        markdown += `  - **DIY Solution**: ${techOptions[1]} (Recommended for cost optimization, full control)\n\n`;
      });
    } else {
      markdown += `No components defined in the current canvas.\n\n`;
    }

    markdown += `### 2.2. Connections (Edges)\n\n`;
    if (canvasEdges.length > 0) {
      canvasEdges.forEach((edge: Edge) => {
        const sourceNode = canvasNodes.find(n => n.id === edge.source);
        const targetNode = canvasNodes.find(n => n.id === edge.target);
        if (sourceNode && targetNode) {
          markdown += `- Data flows from **${sourceNode.data.label}** to **${targetNode.data.label}** (Edge ID: acktick${edge.id}acktick). This connection facilitates ${sourceNode.data.category} to ${targetNode.data.category} communication.\n`;
        }
      });
    } else {
      markdown += `No connections defined in the current canvas.\n\n`;
    }

    // 3. Technical Specification
    markdown += `## 3. Technical Specification\n\n`;
    markdown += `This section provides a high-level technical breakdown for implementation. Specific choices for managed services vs. DIY solutions should be made based on project priorities (e.g., speed of deployment vs. cost control).\n\n`;

    const categories = Array.from(new Set(canvasNodes.map(node => node.data.category)));

    categories.forEach(category => {
      markdown += `### 3.1. ${category.charAt(0).toUpperCase() + category.slice(1)} Layer\n\n`;
      const nodesInCategory = canvasNodes.filter(node => node.data.category === category);
      nodesInCategory.forEach(node => {
        markdown += `#### ${node.data.label}\n\n`;
        markdown += `- **Purpose**: ${node.data.description}\n`;
        markdown += `- **Recommended Technologies**: Consider using either **${node.data.techOptions[0]}** (Managed) or **${node.data.techOptions[1]}** (DIY) based on project needs.\n\n`;
      });
    });

    // 4. Deployment Instructions
    markdown += `## 4. Deployment Instructions\n\n`;
    markdown += `This section outlines general deployment considerations and steps. Specific commands and configurations will depend on the chosen cloud provider and technologies.\n\n`;

    markdown += `### 4.1. General Deployment Steps\n\n`;
    markdown += `1.  **Version Control**: Ensure all code is managed in a Git repository (e.g., GitHub, GitLab, Bitbucket).\n`;
    markdown += `2.  **CI/CD Pipeline**: Set up a Continuous Integration/Continuous Deployment (CI/CD) pipeline (e.g., GitHub Actions, GitLab CI, Jenkins, AWS CodePipeline) to automate testing and deployment.\n`;
    markdown += `3.  **Cloud Provider Selection**: Choose a cloud provider (e.g., AWS, Google Cloud, Azure, Vercel for frontend) that aligns with the project's requirements and budget.\n`;
    markdown += `4.  **Infrastructure as Code (IaC)**: Consider using tools like Terraform or AWS CloudFormation to define and provision infrastructure programmatically.\n`;
    markdown += `5.  **Monitoring & Logging**: Implement comprehensive monitoring (e.g., Prometheus, Grafana, CloudWatch) and centralized logging (e.g., ELK Stack, Datadog) for operational visibility.\n\n`;

    markdown += `### 4.2. API Key Acquisition & Configuration\n\n`;
    markdown += `Many services will require API keys for authentication and access. Follow these general steps:\n`;
    markdown += `1.  **Identify Required APIs**: Review the chosen technologies (e.g., Auth0, AWS S3, external payment gateways) to identify all necessary API integrations.\n`;
    markdown += `2.  **Create Accounts**: Sign up for accounts with the respective service providers.\n`;
    markdown += `3.  **Generate API Keys**: Within each service's dashboard, locate the section for API key generation. Generate new keys, ensuring they have the minimum necessary permissions.\n`;
    markdown += `4.  **Secure Storage**: **NEVER hardcode API keys in your codebase.** Use environment variables (e.g., acktick.envacktick files for local development, secrets management services like AWS Secrets Manager, Azure Key Vault, HashiCorp Vault for production) to store and access keys securely.\n`;
    markdown += `5.  **Configuration**: Configure your application to read API keys from environment variables or a secrets management service.\n\n`;

    // 5. Simulation Insights (Optional, based on simulationState)
    if (simulationState && simulationState.systemMetrics) {
      markdown += `## 5. Simulation Insights\n\n`;
      markdown += `Based on the simulated traffic of ${appState.controls.traffic} users, here are the key performance indicators:\n\n`;
      markdown += `- **Estimated Total Monthly Cost**: ${simulationState.systemMetrics.totalCost.toFixed(2)}\n`;
      markdown += `- **Average System Response Time**: ${simulationState.systemMetrics.averageResponseTime.toFixed(2)} ms (lower is better)\n`;
      markdown += `- **Overall System Reliability**: ${simulationState.systemMetrics.reliability.toFixed(2)}% (higher is better)\n\n`;

      if (simulationState.recommendations && simulationState.recommendations.length > 0) {
        markdown += `### Recommendations from Simulation\n\n`;
        simulationState.recommendations.forEach((rec) => {
          markdown += `- ${rec}\n`;
        });
        markdown += `\n`;
      }
    }

    // 6. Future Considerations & Scalability
    markdown += `## 6. Future Considerations & Scalability\n\n`;
    markdown += `This initial design provides a solid foundation. As the application evolves, consider the following:\n`;
    markdown += `1.  **Microservices Adoption**: For very large-scale applications, consider breaking down monolithic services into smaller, independently deployable microservices.\n`;
    markdown += `2.  **Advanced Caching**: Implement multi-tier caching strategies (e.g., CDN, in-memory, distributed cache) for optimal performance.\n`;
    markdown += `3.  **Database Sharding/Replication**: For extreme data loads, explore database sharding or advanced replication techniques.\n`;
    markdown += `4.  **Observability**: Enhance monitoring, logging, and tracing capabilities for deeper insights into system health and performance.\n`;
    markdown += `5.  **Security Audits**: Regularly conduct security audits and penetration testing to identify and mitigate vulnerabilities.\n\n`;

    return markdown;
  }
}

