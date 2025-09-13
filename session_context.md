# Session Context

## Project Summary

*   **Name:** CanvasTutor
*   **Purpose:** An AI-powered, beginner-friendly application to visualize, simulate, and understand system architectures.
*   **Core Features:**
    *   AI-powered component generation from natural language descriptions.
    *   Interactive drag-and-drop canvas for system design.
    *   Real-time simulation of system performance with adjustable parameters.
    *   Educational narration to explain the impact of design choices.
    *   Export designs to JSON and Markdown.
*   **Tech Stack:** React, TypeScript, Vite, React Flow, shadcn/ui, Tailwind CSS.

## Recent Changes

*   **Removed `playwright-mcp` submodule:** Deinitialized and removed the submodule and its related files, as it was not required for the project's core functionality.
*   **Removed Session Management and Local Storage Integration:**
    *   Deleted `src/components/SaveSessionDialog.tsx` and `src/components/SessionManager.tsx`.
    *   Removed all `localStorage` integration related to session saving.
    *   Cleaned up `AppStateContext.tsx` to remove session-related state and functions (`sessions`, `currentSessionId`, `saveCurrentSession`, `loadSession`, `createNewSession`, `deleteSession`).
    *   Removed session-related routes and UI elements from `App.tsx` (e.g., "Sessions" button).
*   **Traffic Control UI Redesign:**
    *   Replaced the traffic slider in `ControlsPanel.tsx` with a `Tabs` component.
    *   Each tab now represents a traffic threshold (1K, 10K, 100K, 500K, 1M).
    *   Tab changes now directly update the traffic level in `AppStateContext`.
    *   Visual markers for thresholds are rendered on the tabs, with highlighting for the active threshold.
*   **Dynamic Graph Modification based on Traffic Thresholds:**
    *   Implemented `onTrafficThresholdChange` in `AppStateContext.tsx` to dynamically add/remove components (nodes and edges) based on traffic thresholds.
    *   Integrated LLM (OpenRouter API) to provide threshold-based component suggestions (nodes, edges, and their properties) on initial load.
    *   Ensured components are removed when traffic drops below a threshold.
    *   Improved node placement and connection logic using `getLayoutedElements` and a more robust `ensureConnected` function in `src/lib/utils.ts`.
*   **Animated Edge Dot Color Change:**
    *   Changed the color of the animated dots on edges from red to blue in `AnimatedEdge.tsx`.
*   **Node Context Menu with Contextual Prompts:**
    *   Added a context menu to nodes in `CustomNode.tsx` that appears on right-click.
    *   The context menu contains buttons for predefined contextual prompts (e.g., "Explain this component").
    *   Clicking a prompt button now populates the chat input field with an expanded, context-rich prompt, allowing the user to review and send it to Ada.
    *   Improved context menu positioning to be relative to the node and on a higher z-axis.
*   **Ada Chat Contextual Awareness:**
    *   Modified `onSendChatbotMessage` in `AppStateContext.tsx` to include the current graph context (nodes and edges) in the messages sent to the LLM, enabling Ada to provide more relevant responses.
    *   Modified `onSendAdaMessage` to format the initial user input into a polished, human-readable sentence for Ada's initial greeting.
*   **Custom Node UI Improvement:**
    *   The custom nodes are now circular, with icons on top in a black circle, and no ID displayed.
    *   Improved hierarchy of text and icons, and subtle pulsing animations.
*   **Legend of Colors:**
    *   A `CategoryLegend` component has been added to display a legend of node colors.
*   **Export Markdown Content Refinement:**
    *   The `generateSpecMarkdown` function in `ExportService.ts` has been significantly enhanced to produce a more detailed, AI-ready software architect spec plan, incorporating user input, use cases, cost reduction techniques, a glossary of terms (enriched by chatbot interactions), a specific scale-up plan, and clear next steps.
    *   It now includes:
        *   **Project Overview & Use Cases:** Expands on the user's input prompt to flesh out the idea and list core use cases.
        *   **System Architecture:** Detailed breakdown of components (nodes) with their purpose, technology considerations (Managed/DIY options), estimated base monthly cost, key performance indicators, and scaling behavior.
        *   **Cost Reduction Techniques:** For each component, specific cost reduction techniques are suggested based on its category and chosen tech.
        *   **Connections (Edges):** Describes data flow between connected components.
        *   **Technical Specification (High-Level):** Outlines high-level technical choices per layer (e.g., Frontend, Backend, Database).
        *   **Deployment Strategy:** Provides general deployment steps (Version Control, CI/CD, Cloud Provider, IaC, Monitoring & Logging, Containerization) and detailed API Key Management & Security best practices.
        *   **Simulation Insights:** (If available) Presents key performance indicators based on simulated traffic.
        *   **Scale-Up Plan:** Outlines phased scale-up strategies for initial growth, accelerated growth, and hypergrowth.
        *   **Glossary of Terms:** Defines key technical jargon used in the document, with additional context from Ada's chat messages.
        *   **Next Steps:** Guides the user on how to proceed with the report.
    *   The markdown formatting for code snippets (backticks) has been corrected.
*   **Export Modal UI Improvement:**
    *   The `ExportPanel.tsx` component now uses `ReactMarkdown` to render the generated markdown content, ensuring proper display of tables, headings, and highlights.
    *   The modal's dimensions and scrolling behavior have been optimized for better readability.

## Pending Implementations (from `tasks.md`)

*   [x] 10. Export Functionality
*   [ ] **Session Management Refinement:**
    *   Ensure each save creates a *new* session entry unless explicitly updating an existing one.
    *   Implement full session loading to restore canvas (nodes, edges) and chat history.


