import type { AppState } from '@/types';
import type { Node, Edge } from '@xyflow/react';
import type { CustomNodeData } from '@/types';

/**
 * Service responsible for exporting application state into various formats,
 * primarily JSON and a detailed Markdown system specification.
 */
export class ExportService {
  /**
   * Exports the current application state as a JSON string.
   * This includes user input, component definitions, canvas nodes/edges,
   * and simulation results.
   * @param appState The current state of the application.
   * @returns A JSON string representation of the application state.
   */
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

  /**
   * Generates a comprehensive software architect specification in Markdown format.
   * This specification expands on user input, details system components,
   * suggests cost reduction techniques, outlines a scale-up plan,
   * provides a glossary of terms (enriched by chatbot interactions), and defines next steps.
   * @param appState The current state of the application, including user input, canvas elements,
   *                 simulation results, and chatbot messages.
   * @returns A Markdown string representing the system design specification.
   */
  generateSpecMarkdown(appState: AppState): string {
    const { userInput, canvasNodes, canvasEdges, simulationState, chatbotMessages } = appState;

    /**
     * Helper function to format the raw user input (which might be JSON)
     * into a more readable sentence for the specification document.
     * It extracts description, goal, features, and tech preferences.
     * @param input The raw user input string.
     * @returns A formatted string describing the user's project intent.
     */
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
        // If input is not JSON or parsing fails, treat it as a plain string.
        return `The user provided the following input: "${input}".`;
      }
    };

    /**
     * Helper function to extract potential use cases from the user's input.
     * It attempts to parse a 'features' field from the input JSON.
     * @param input The raw user input string.
     * @returns An array of strings, each representing a use case.
     */
    const extractUseCases = (input: string): string[] => {
      try {
        const parsedInput = JSON.parse(input);
        if (parsedInput.features) {
          return parsedInput.features.split(',').map((s: string) => s.trim());
        }
      } catch (e) {
        // Fallback to generic use cases if parsing fails or features are not present.
      }
      return ["Core system functionality", "User interaction", "Data processing"];
    };

    /**
     * Helper function to provide generic cost reduction techniques based on a component's category.
     * This helps in offering actionable advice for optimizing infrastructure costs.
     * @param category The category of the component (e.g., 'database', 'compute').
     * @returns An array of strings, each describing a cost reduction technique.
     */
    const getCostReductionTechniques = (category: string): string[] => {
      switch (category.toLowerCase()) {
        case 'database':
          return [
            "Optimize queries and indexing.",
            "Utilize serverless database options for pay-per-use billing.",
            "Implement data archiving and lifecycle policies.",
            "Choose open-source databases over commercial ones where feasible.",
          ];
        case 'compute':
          return [
            "Right-size instances to match workload requirements.",
            "Use spot instances or reserved instances for predictable workloads.",
            "Implement auto-scaling to scale down during low demand.",
            "Leverage serverless functions (e.g., AWS Lambda, Azure Functions) for event-driven tasks.",
          ];
        case 'storage':
          return [
            "Implement data lifecycle management to move old data to cheaper storage tiers.",
            "Use data compression techniques.",
            "Choose object storage (e.g., S3) for unstructured data over block storage.",
            "Regularly review and delete unneeded data.",
          ];
        case 'network':
          return [
            "Optimize data transfer paths to minimize egress costs.",
            "Use Content Delivery Networks (CDNs) to cache content closer to users.",
            "Consolidate network resources.",
          ];
        case 'messaging':
          return [
            "Batch messages to reduce API call overhead.",
            "Optimize message retention periods.",
            "Consider open-source message brokers for self-hosting if expertise is available.",
          ];
        case 'cache':
          return [
            "Optimize cache hit ratio to reduce backend load.",
            "Use managed caching services with auto-scaling.",
            "Right-size cache instances.",
          ];
        default:
          return [
            "Regularly review resource utilization and optimize.",
            "Leverage cloud provider cost management tools.",
            "Automate shutdown of non-production environments during off-hours.",
          ];
      }
    };

    /**
     * Helper function to build a glossary of technical terms.
     * It attempts to extract definitions from the assistant's chatbot messages
     * and provides default definitions for common terms if not found in chat.
     * This enriches the document with context relevant to the user's interaction.
     * @param messages An array of chatbot messages.
     * @returns A record (object) where keys are terms and values are their definitions.
     */
    const buildGlossaryFromChat = (messages: { role: 'user' | 'assistant'; content: string }[]): Record<string, string> => {
      const glossary: Record<string, string> = {};
      // List of terms to actively look for in chatbot responses
      const termsToLookFor = [
        "API", "Microservices", "CI/CD", "IaC", "CDN", "Database Sharding", "Observability",
        "Latency", "Throughput", "Scalability", "Reliability", "Availability", "Load Balancer",
        "Containerization", "Kubernetes", "Serverless", "Managed Service", "DIY Solution",
        "Egress", "Ingress", "SQL", "NoSQL", "Message Queue", "Cache", "DNS", "VPN", "Firewall"
      ];

      messages.forEach(msg => {
        if (msg.role === 'assistant') {
          termsToLookFor.forEach(term => {
            // Use regex for case-insensitive whole word matching to find terms in messages
            const regex = new RegExp(`\\b${term}\\b`, 'i');
            if (regex.test(msg.content) && !glossary[term]) {
              // Simple extraction: find the first sentence where the term appears
              const sentences = msg.content.split(/(?<=[.!?])\\s+/);
              const definitionSentence = sentences.find(s => regex.test(s));
              if (definitionSentence) {
                glossary[term] = definitionSentence.trim();
              }
            }
          });
        }
      });

      // Add some default terms if they were not found or defined in the chat
      if (!glossary["API"]) glossary["API"] = "Application Programming Interface: A set of rules and definitions that allows different software applications to communicate with each other.";
      if (!glossary["Microservices"]) glossary["Microservices"] = "An architectural style that structures an application as a collection of loosely coupled, independently deployable services.";
      if (!glossary["CI/CD"]) glossary["CI/CD"] = "Continuous Integration/Continuous Deployment: A set of practices that enable rapid and reliable delivery of software by automating the build, test, and deployment processes.";
      if (!glossary["IaC"]) glossary["IaC"] = "Infrastructure as Code: Managing and provisioning computer data centers through machine-readable definition files, rather than physical hardware configuration or interactive configuration tools.";
      if (!glossary["CDN"]) glossary["CDN"] = "Content Delivery Network: A geographically distributed network of proxy servers and their data centers. The goal is to provide high availability and performance by distributing the service spatially relative to end-users.";
      if (!glossary["Scalability"]) glossary["Scalability"] = "The ability of a system to handle a growing amount of work by adding resources.";
      if (!glossary["Reliability"]) glossary["Reliability"] = "The probability that a system will perform its intended function without failure for a specified period under specified conditions.";
      if (!glossary["Managed Service"]) glossary["Managed Service"] = "A service provided by a third party that takes responsibility for a specific part of a customer's IT infrastructure or functions.";
      if (!glossary["Serverless"]) glossary["Serverless"] = "A cloud-native development model that allows developers to build and run applications without having to manage servers.";
      if (!glossary["Containerization"]) glossary["Containerization"] = "A lightweight form of virtualization that packages an application and its dependencies into a single unit (container) that can run consistently across different environments.";

      return glossary;
    };

    let markdown = `# System Design Specification\n\n`;

    // 1. Project Overview & Use Cases
    // This section provides a high-level summary of the project and its primary functionalities,
    // expanding on the user's initial input to form a coherent vision.
    markdown += `## 1. Project Overview & Use Cases\n\n`;
    markdown += `This document outlines the design and implementation details of a system architecture, generated using CanvasTutor based on user requirements.\n\n`;
    markdown += `### 1.1. User Requirements & Vision\n\n`;
    markdown += `${formatUserInput(userInput)}\n\n`;

    markdown += `### 1.2. Key Use Cases\n\n`;
    const useCases = extractUseCases(userInput);
    if (useCases.length > 0) {
      useCases.forEach((uc, index) => {
        markdown += `${index + 1}. **${uc}**: A primary function of the system, enabling users to ${uc.toLowerCase().replace('a ', '').replace('an ', '')}.\n`;
      });
      markdown += `\n`;
    } else {
      markdown += `No specific use cases were detailed in the input, but the system is designed to handle core functionalities related to the project vision.\n\n`;
    }

    // 2. System Architecture
    // This section details the individual components (nodes) and their interconnections (edges)
    // within the system, including their purpose, metrics, and cost optimization strategies.
    markdown += `## 2. System Architecture\n\n`;
    markdown += `The system architecture is composed of various interconnected components designed to fulfill the specified requirements. This section details each component, its estimated costs, and strategies for cost optimization.\n\n`;

    markdown += `### 2.1. Components (Nodes)\n\n`;
    if (canvasNodes.length > 0) {
      canvasNodes.forEach((node: Node<CustomNodeData>) => {
        const { id, data } = node;
        const { label, description, category, techOptions, baseMetrics, scalingFactors } = data;
        markdown += `#### ${label} (ID: \`${id}\`)\n\n`; // Corrected backtick escaping
        markdown += `- **Description**: ${description}\n`;
        markdown += `- **Category**: ${category}\n`;
        markdown += `- **Base Metrics**:\n`;
        markdown += `  - Responsiveness: ${baseMetrics.responsiveness} ms\n`;
        markdown += `  - Cost: $${baseMetrics.cost}/month\n`;
        markdown += `  - Reliability: ${baseMetrics.reliability}%\n`;
        markdown += `- **Scaling Factors**:\n`;
        markdown += `  - Traffic Impact: ${scalingFactors.traffic} (e.g., how much performance degrades with increased traffic)\n`;
        markdown += `  - Instance Impact: ${scalingFactors.instances} (e.g., how much performance improves with more instances)\n`;
        markdown += `- **Technology Options**:\n`;
        markdown += `  - **Managed Service**: ${techOptions[0]} (Recommended for ease of use, faster deployment)\n`;
        markdown += `  - **DIY Solution**: ${techOptions[1]} (Recommended for cost optimization, full control)\n\n`;

        markdown += `##### Cost Reduction Techniques for ${label}\n\n`;
        getCostReductionTechniques(category).forEach(technique => {
          markdown += `- ${technique}\n`;
        });
        markdown += `\n`;
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
          markdown += `- Data flows from **${sourceNode.data.label}** to **${targetNode.data.label}** (Edge ID: \`${edge.id}\`). This connection facilitates ${sourceNode.data.category} to ${targetNode.data.category} communication.\n`; // Corrected backtick escaping
        }
      });
    } else {
      markdown += `No connections defined in the current canvas.\n\n`;
    }

    // 3. Technical Specification
    // This section provides a high-level technical breakdown, categorizing components
    // by layer and suggesting appropriate technologies.
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

    // 4. Deployment Strategy
    // This section outlines general steps and best practices for deploying the system,
    // including version control, CI/CD, cloud provider selection, and API key management.
    markdown += `## 4. Deployment Strategy\n\n`;
    markdown += `This section outlines general deployment considerations and steps. Specific commands and configurations will depend on the chosen cloud provider and technologies.\n\n`;

    markdown += `### 4.1. General Deployment Steps\n\n`;
    markdown += `1.  **Version Control**: Ensure all code is managed in a Git repository (e.g., GitHub, GitLab, Bitbucket).\n`;
    markdown += `2.  **CI/CD Pipeline**: Set up a Continuous Integration/Continuous Deployment (CI/CD) pipeline (e.g., GitHub Actions, GitLab CI, Jenkins, AWS CodePipeline) to automate testing and deployment.\n`;
    markdown += `3.  **Cloud Provider Selection**: Choose a cloud provider (e.g., AWS, Google Cloud, Azure, Vercel for frontend) that aligns with the project's requirements and budget.\n`;
    markdown += `4.  **Infrastructure as Code (IaC)**: Consider using tools like Terraform or AWS CloudFormation to define and provision infrastructure programmatically.\n`;
    markdown += `5.  **Monitoring & Logging**: Implement comprehensive monitoring (e.g., Prometheus, Grafana, CloudWatch) and centralized logging (e.g., ELK Stack, Datadog) and alerting for operational visibility.\n\n`;

    markdown += `### 4.2. API Key Acquisition & Configuration\n\n`;
    markdown += `Many services will require API keys for authentication and access. Follow these general steps:\n`;
    markdown += `1.  **Identify Required APIs**: Review the chosen technologies (e.g., Auth0, AWS S3, external payment gateways) to identify all necessary API integrations.\n`;
    markdown += `2.  **Create Accounts**: Sign up for accounts with the respective service providers.\n`;
    markdown += `3.  **Generate API Keys**: Within each service's dashboard, locate the section for API key generation. Generate new keys, ensuring they have the minimum necessary permissions.\n`;
    markdown += `4.  **Secure Storage**: **NEVER hardcode API keys in your codebase.** Use environment variables (e.g., \`.env\` files for local development, secrets management services like AWS Secrets Manager, Azure Key Vault, HashiCorp Vault for production) to store and access keys securely.\n`;
    markdown += `5.  **Configuration**: Configure your application to read API keys from environment variables or a secrets management service.\n\n`;

    // 5. Simulation Insights (Optional, based on simulationState)
    // This section presents key performance indicators and recommendations derived from the system simulation,
    // offering data-driven insights into the design's behavior under load.
    if (simulationState && simulationState.systemMetrics) {
      markdown += `## 5. Simulation Insights\n\n`;
      markdown += `Based on the simulated traffic of ${appState.controls.traffic} users, here are the key performance indicators:\n\n`;
      markdown += `- **Estimated Total Monthly Cost**: $${simulationState.systemMetrics.totalCost.toFixed(2)}\n`;
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

    // 6. Scale-Up Plan
    // This section provides a phased strategy for scaling the system to handle increasing user loads,
    // from initial growth to hypergrowth, detailing specific techniques for each phase.
    markdown += `## 6. Scale-Up Plan\n\n`;
    markdown += `A well-defined scaling strategy is crucial for handling increased demand and ensuring continued performance and availability.\n\n`;

    markdown += `### 6.1. Phase 1: Initial Growth (0 - 10,000 Users)\n\n`;
    markdown += `Focus on optimizing existing resources and implementing basic scaling mechanisms.\n`;
    markdown += `-   **Vertical Scaling**: Upgrade individual component resources (e.g., larger database instances, more powerful compute VMs).\n`;
    markdown += `-   **Load Balancing**: Introduce load balancers to distribute traffic evenly across multiple instances of stateless services.\n`;
    markdown += `-   **Caching**: Implement caching at various layers (CDN, in-memory, database query cache) to reduce load on backend services.\n`;
    markdown += `-   **Monitoring & Alerting**: Enhance monitoring to detect bottlenecks early and set up alerts for critical thresholds.\n\n`;

    markdown += `### 6.2. Phase 2: Accelerated Growth (10,000 - 1,000,000 Users)\n\n`;
    markdown += `Introduce horizontal scaling and architectural changes to support significant user growth.\n`;
    markdown += `-   **Horizontal Scaling (Auto-scaling)**: Implement auto-scaling groups for compute resources to automatically add/remove instances based on demand.\n`;
    markdown += `-   **Database Read Replicas**: For read-heavy workloads, add database read replicas to offload the primary database.\n`;
    markdown += `-   **Asynchronous Processing**: Use message queues (e.g., Kafka, RabbitMQ, SQS) for background tasks and decoupling services.\n`;
    markdown += `-   **Microservices (Initial)**: Begin to identify and extract highly independent services into microservices to allow for independent scaling.\n`;
    markdown += `-   **Stateless Services**: Design services to be stateless to facilitate easier horizontal scaling.\n\n`;

    markdown += `### 6.3. Phase 3: Hypergrowth (1,000,000+ Users)\n\n`;
    markdown += `Advanced architectural patterns and global distribution for extreme scale and resilience.\n`;
    markdown += `-   **Database Sharding/Partitioning**: Distribute data across multiple database instances to overcome single-node limitations.\n`;
    markdown += `-   **Global Distribution**: Deploy services across multiple regions or availability zones for disaster recovery and reduced latency.\n`;
    markdown += `-   **Advanced Caching Strategies**: Implement multi-layered, distributed caching solutions.\n`;
    markdown += `-   **Event-Driven Architecture**: Fully embrace event-driven patterns for maximum decoupling and scalability.\n`;
    markdown += `-   **Chaos Engineering**: Proactively test system resilience by injecting failures to identify weaknesses.\n\n`;

    // 7. Glossary of Terms
    // This section defines key technical jargon used throughout the document,
    // providing clarity and a common understanding for stakeholders.
    // Definitions are enriched by interactions with the chatbot (Ada).
    markdown += `## 7. Glossary of Terms\n\n`;
    markdown += `Understanding the following technical terms will be crucial for building and managing this application:\n\n`;

    const glossary = buildGlossaryFromChat(chatbotMessages);
    for (const term in glossary) {
      markdown += `- **${term}**: ${glossary[term]}\n`;
    }
    markdown += `\n`;

    // 8. Next Steps
    // This section provides actionable guidance on how to proceed with the generated report,
    // suggesting further design, analysis, and development activities.
    markdown += `## 8. Next Steps\n\n`;
    markdown += `This report provides a comprehensive architectural plan. To move forward, consider the following:\n`;
    markdown += `1.  **Detailed Design**: Elaborate on the high-level technical specifications for each component, including specific technologies, APIs, and data models.\n`;
    markdown += `2.  **Cost Analysis Refinement**: Conduct a more in-depth cost analysis using cloud provider calculators based on anticipated usage patterns.\n`;
    markdown += `3.  **Proof of Concept (PoC)**: Develop small-scale PoCs for critical or complex components to validate technical feasibility and performance.\n`;
    markdown += `4.  **Team Alignment**: Share this document with your development team to ensure everyone is aligned on the architectural vision and implementation strategy.\n`;
    markdown += `5.  **Iterate**: System design is an iterative process. Be prepared to refine this plan as you gain more insights during development and testing.\n`;
    markdown += `6.  **Security Review**: Conduct a thorough security review of the proposed architecture and implementation plan.\n\n`;

    return markdown;
  }
}
