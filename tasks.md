# Implementation Plan

- [x] 1. Project Setup and Core Infrastructure
  - Initialize React + TypeScript project with Vite
  - Install and configure React Flow, shadcn/ui, Tailwind CSS
  - Set up project structure with components, services, and types directories
  - Create basic App component with routing between input/canvas/export views
  - _Requirements: 8.1, 8.5_

- [ ] 2. Component Type Definitions and Interfaces
  - Create TypeScript interfaces for ComponentCard, NodeMetrics, SimulationState
  - Define ControlsState interface and simulation parameter types
  - Create UserInput interface for structured input parsing
  - Write type definitions for React Flow node and edge data structures
  - _Requirements: 2.2, 4.1, 6.2_

- [ ] 3. Input Collection UI
  - [ ] 3.1 Create InputPrompt component with shadcn/ui form elements
    - Build form with textarea for "What do you want to build?" prompt
    - Add optional structured input fields for goal/features/tech preferences
    - Implement form validation and submission handling
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 3.2 Add loading states and user feedback
    - Create loading spinner component for processing state
    - Add success/error message display
    - Implement form reset functionality
    - _Requirements: 1.3, 8.4_

- [ ] 4. Component Extractor Service
  - [ ] 4.1 Create ComponentExtractorService class
    - Implement extractComponents method with input parsing logic
    - Create component template definitions for common system types
    - Add structured input parser for "goal / features / tech" format
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 4.2 Build component generation logic
    - Create mapping from user descriptions to component templates
    - Implement logic to select 3-8 relevant components based on input
    - Add tech option selection (managed vs DIY) for each component
    - Write unit tests for component extraction with 3 test cases
    - _Requirements: 2.1, 2.2, 2.4, 7.3_

- [ ] 5. Component Cards Palette UI
  - [ ] 5.1 Create ComponentCard display component
    - Build card component showing id, label, description, and tech options
    - Implement drag-and-drop functionality using React Flow's drag API
    - Add visual feedback for draggable state
    - _Requirements: 3.1, 3.2_

  - [ ] 5.2 Create ComponentsPalette container
    - Display generated components in a scrollable palette
    - Handle component selection and drag initiation
    - Add empty state when no components are generated
    - _Requirements: 3.1_

- [ ] 6. Canvas Implementation
  - [ ] 6.1 Set up React Flow canvas component
    - Create Canvas component with React Flow integration
    - Configure drag-and-drop from palette to canvas
    - Implement node creation from dropped components
    - Add basic node styling with id and label display
    - _Requirements: 3.2, 3.3, 3.5_

  - [ ] 6.2 Add node connection functionality
    - Enable edge creation between canvas nodes
    - Implement connection validation rules
    - Add visual feedback for connection attempts
    - Style edges with basic arrow markers
    - _Requirements: 3.3_

  - [ ] 6.3 Create custom node component with metrics display
    - Build CustomNode component showing mini-stats (Responsiveness emoji, Traffic #, Cost)
    - Add node selection and editing capabilities
    - Implement tech choice toggle (managed/DIY) per node
    - _Requirements: 3.4_

- [ ] 7. Controls Panel Implementation
  - [ ] 7.1 Create ControlsPanel component
    - Build Traffic slider (0-1000) with shadcn/ui Slider component
    - Add Instances number input (1-10) with validation
    - Create Cache toggle buttons (Off/Small/Large)
    - Implement Vendor toggle (Managed/DIY)
    - _Requirements: 4.1_

  - [ ] 7.2 Add Play button and simulation trigger
    - Create Play/Stop button with loading states
    - Implement simulation trigger logic
    - Add visual feedback during simulation runs
    - _Requirements: 4.2_

- [ ] 8. Simulation Engine Core
  - [ ] 8.1 Create SimulationService class
    - Implement calculateNodeMetrics method with deterministic formulas
    - Create cost calculation logic based on component types and scaling
    - Add responsiveness calculation based on traffic and instances
    - Write unit tests for simulation math with 3 different scenarios
    - _Requirements: 4.2, 4.4, 7.1_

  - [ ] 8.2 Implement data flow animation
    - Create token animation system for edges
    - Add moving token visualization along connection paths
    - Implement animation timing based on traffic levels
    - _Requirements: 4.3_

  - [ ] 8.3 Add "Show math" functionality
    - Create toggle component for revealing calculation formulas
    - Display formula explanations in beginner-friendly format
    - Show step-by-step calculation breakdown
    - _Requirements: 4.5_

- [ ] 9. Educational Narration System
  - [ ] 9.1 Create NarrationService
    - Implement generateNarration method for lever changes
    - Create plain-English explanation templates
    - Add suggestion generation for cost optimization
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 9.2 Integrate narration with controls
    - Connect narration service to controls panel changes
    - Display explanations in dedicated UI panel
    - Add animation/transition effects for narration updates
    - _Requirements: 5.1, 5.4_

- [ ] 10. Export Functionality
  - [ ] 10.1 Create ExportService
    - Implement JSON export for canvas state and components
    - Create requirements.md generator with user stories
    - Add plain-English specification generation
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ] 10.2 Build export UI component
    - Create export dialog with preview functionality
    - Add copy-to-clipboard functionality
    - Implement file download for generated specifications
    - _Requirements: 6.3_

- [ ] 11. Automation Hooks Implementation
  - [ ] 11.1 Create canvas save hook
    - Implement automatic spec regeneration on canvas changes
    - Add debouncing to prevent excessive regeneration
    - Create visual feedback for auto-save operations
    - _Requirements: 9.1, 9.3_

  - [ ] 11.2 Create lever change hook
    - Implement automatic narration on control changes
    - Add smooth transitions for narration updates
    - Ensure hook execution completes within 500ms
    - _Requirements: 9.2, 9.3_

- [ ] 12. Testing Implementation
  - [ ] 12.1 Write component unit tests
    - Test InputPrompt component rendering and form submission
    - Test ComponentCard drag functionality
    - Test ControlsPanel slider and toggle interactions
    - _Requirements: 7.2_

  - [ ] 12.2 Create integration tests
    - Test complete drag-and-drop flow from palette to canvas
    - Test simulation execution and metrics updates
    - Test export generation and download functionality
    - _Requirements: 7.2_

- [ ] 13. Performance Optimization and Polish
  - [ ] 13.1 Optimize rendering performance
    - Add React.memo to expensive components
    - Implement debouncing for simulation triggers
    - Optimize canvas rendering for smooth 60fps interactions
    - _Requirements: 8.2, 8.3_

  - [ ] 13.2 Add error handling and user feedback
    - Implement error boundaries for component failures
    - Add user-friendly error messages
    - Create fallback states for failed operations
    - _Requirements: 8.4_

- [ ] 14. Final Integration and Demo Setup
  - Create demo data and example scenarios
  - Write comprehensive README with setup instructions
  - Add example user inputs and expected outputs
  - Verify all acceptance criteria are met through manual testing
  - _Requirements: 1.4, 2.1, 4.2, 6.4_