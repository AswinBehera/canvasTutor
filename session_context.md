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

*   **User Authentication Reverted:** Removed all login-related features (login page, protected routes, authentication state).
*   **AI Insights Section Removed:** Deleted the `ExtractionInsights` component and related state/imports.
*   **Cost Display UI Enhanced:** Removed card wrapper from `CostDisplay`, added visual indicators (colors) for cost levels, and set initial controls for least possible cost.
*   **Resizable Panels Adjusted:** Configured left panel for 40% CostDisplay and 60% Chatbot vertical space.
*   **Play Simulation Button Improved:** Made button larger, ensured text and animation reflect `isSimulating` state ("Simulate" / "Simulating...").
*   **Initial Chatbot Message Refined:** Ada's initial message is now more relevant to the canvas and sent directly without a user prompt.
*   **Chat Suggestion Cue Cards Added:** Implemented hardcoded suggestion buttons above the chat input.
*   **Chatbot Context:** The chatbot "Ada" now has context of the user's input and the generated components, allowing for more specific and helpful advice.
*   **Visual Simulation Feedback:** The simulation levers now provide visual feedback on the graph:
    *   **Traffic:** The number of animated dots on the edges increases with traffic.
    *   **Instances:** The number of instances is displayed on each node.
    *   **Cache:** A cache icon is displayed on nodes when caching is enabled.
    *   **Managed vs. DIY:** The border style of nodes changes based on the selected vendor type.
*   **Narration Service Removed:** The narration service has been removed to improve user experience.
*   **Chat Window UI/UX:** The chat window has been given more horizontal space, and now renders Markdown for better readability.
*   **Simplified Chatbot Persona:** The chatbot "Ada" now only replies in a simplified "as if I am 12" version.

## Pending Implementations (from `tasks.md`)

*   [ ] 10. Export Functionality
*   [ ] **Session Management Refinement:**
    *   Ensure each save creates a *new* session entry unless explicitly updating an existing one.
    *   Implement full session loading to restore canvas (nodes, edges) and chat history.


