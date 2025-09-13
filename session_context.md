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
*   [ ] 11. Automation Hooks Implementation
*   [ ] 12. Testing Implementation
*   [ ] 13. Performance Optimization and Polish
*   [ ] 14. Final Integration and Demo Setup
*   [ ] **Session Management Refinement:**
    *   Ensure each save creates a *new* session entry unless explicitly updating an existing one.
    *   Implement full session loading to restore canvas (nodes, edges) and chat history.
*   [ ] **Chat Window Scrolling Fix:** Resolve the issue where the chat window causes the entire page to scroll.
*   [ ] **Chat Window Width Adjustment:** Further increase the width of the chat window.
