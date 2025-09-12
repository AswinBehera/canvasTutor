# Requirements Document

## Introduction

CanvasTutor is a single-page, beginner-friendly application that helps users visualize and understand system architecture through an interactive canvas interface. The app starts by asking users what they want to build, generates component cards based on their input, allows drag-and-drop composition on a 2D canvas, and provides real-time simulation with animated data flows and friendly metrics. The goal is to make system design accessible and playable for non-technical users while providing exportable specifications for developers.

## Requirements

### Requirement 1: User Input Collection

**User Story:** As a beginner user, I want to describe what I want to build in simple terms, so that the system can generate relevant components for me.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL display a prompt asking "What do you want to build?"
2. WHEN the user provides input THEN the system SHALL optionally accept structured details in format: "goal / core features / 1-line tech preferences (optional)"
3. WHEN the user submits their description THEN the system SHALL process the input within 2 seconds
4. IF the user provides minimal input THEN the system SHALL still generate meaningful components

### Requirement 2: Component Generation

**User Story:** As a user, I want the system to automatically generate relevant component cards from my description, so that I don't need to know all the technical pieces upfront.

#### Acceptance Criteria

1. WHEN the user submits a description THEN the Component Extractor SHALL return 3-8 component cards in valid JSON format
2. WHEN generating components THEN each card SHALL include id, label, 1-line friendly description, and 2 suggested tech options (managed & DIY)
3. WHEN processing user input THEN the system SHALL generate up to 12 component cards maximum
4. WHEN creating tech options THEN the system SHALL provide both managed service and DIY implementation choices

### Requirement 3: Interactive Canvas Interface

**User Story:** As a user, I want to drag and drop components onto a visual canvas and connect them, so that I can see how my system fits together.

#### Acceptance Criteria

1. WHEN components are generated THEN the system SHALL display them in a draggable cards palette
2. WHEN the user drags a card onto the canvas THEN the system SHALL create a clickable, draggable node with visible id and label
3. WHEN nodes are placed on canvas THEN the user SHALL be able to connect them with animated edges showing moving tokens
4. WHEN nodes are connected THEN the system SHALL display mini-stats: Responsiveness (emoji), Traffic (#), and Cost
5. WHEN the canvas is updated THEN the system SHALL maintain node positions and connections

### Requirement 4: System Controls and Simulation

**User Story:** As a user, I want to adjust system parameters with simple controls and see immediate visual feedback, so that I can understand how changes affect performance.

#### Acceptance Criteria

1. WHEN the canvas has components THEN the system SHALL provide a levers panel with Traffic slider (0-1000), Instances (1-10), Cache (Off/Small/Large), and Vendor toggle (Managed/DIY)
2. WHEN the user clicks Play THEN the simulator SHALL compute Responsiveness and Cost within 200ms using deterministic calculations
3. WHEN simulation runs THEN the system SHALL animate tokens moving along connection edges
4. WHEN parameters change THEN the system SHALL update metrics in real-time without jargon
5. WHEN simulation is active THEN the system SHALL provide a "Show math" toggle revealing calculation formulas

### Requirement 5: Educational Feedback

**User Story:** As a learning user, I want plain-English explanations of what happens when I change parameters, so that I can understand the impact of my decisions.

#### Acceptance Criteria

1. WHEN the user changes any lever THEN the system SHALL display 1-2 sentence plain-English explanation within 1 second
2. WHEN providing explanations THEN the system SHALL include one practical, cost-effective suggestion
3. WHEN explanations are shown THEN the language SHALL be beginner-friendly without technical jargon
4. WHEN multiple changes occur THEN the system SHALL provide cumulative impact explanation

### Requirement 6: Specification Export

**User Story:** As a user who wants to build my system, I want to export my canvas design as both human-readable and developer-friendly formats, so that I can share or implement my design.

#### Acceptance Criteria

1. WHEN the user requests export THEN the system SHALL generate a plain-English spec JSON containing components and flows
2. WHEN exporting THEN the system SHALL create a requirements.md file formatted for coding agents (Kiro)
3. WHEN export is complete THEN the format SHALL be friendly for copy/paste operations
4. WHEN generating requirements.md THEN the system SHALL include 3 user stories derived from the canvas design

### Requirement 7: Testing and Quality Assurance

**User Story:** As a developer, I want the application to be thoroughly tested, so that users have a reliable experience.

#### Acceptance Criteria

1. WHEN the simulator runs THEN unit tests SHALL verify math calculations for 3 different scenarios
2. WHEN the UI loads THEN smoke tests SHALL verify canvas rendering and single card drop functionality
3. WHEN components are generated THEN the system SHALL validate JSON format and required fields
4. WHEN simulation completes THEN the system SHALL verify all metrics are within expected ranges

### Requirement 8: User Experience and Performance

**User Story:** As a user, I want a responsive and intuitive interface, so that I can focus on learning rather than fighting with the tool.

#### Acceptance Criteria

1. WHEN the application loads THEN the initial render SHALL complete within 3 seconds
2. WHEN dragging components THEN the interface SHALL provide smooth visual feedback at 60fps
3. WHEN simulation runs THEN animations SHALL be smooth and not block user interactions
4. WHEN using the application THEN all interactions SHALL provide immediate visual feedback
5. WHEN the interface is displayed THEN it SHALL use shadcn/ui components for consistent styling

### Requirement 9: Automation and Hooks

**User Story:** As a user, I want the system to automatically update related information when I make changes, so that everything stays synchronized.

#### Acceptance Criteria

1. WHEN the canvas is saved THEN the system SHALL automatically regenerate the specification
2. WHEN lever values change THEN the system SHALL automatically provide narration
3. WHEN hooks execute THEN they SHALL complete within 500ms to maintain responsiveness
4. WHEN automatic updates occur THEN the user SHALL receive visual confirmation of the changes