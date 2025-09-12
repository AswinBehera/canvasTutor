# CanvasTutor: Visualize, Simulate, and Master System Architecture

CanvasTutor is a beginner-friendly, AI-powered application designed to help users visualize, simulate, and understand system architectures. Transform complex ideas into clear, actionable system designs with an intuitive drag-and-drop interface and real-time feedback.

## Features

- **AI-Powered Component Generation**: Describe your app in plain language, and our AI suggests core components tailored to your needs.
- **Interactive Canvas**: Visually compose your system on an intuitive canvas, with animated data flows bringing your architecture to life.
- **Real-time Simulation & Insights**: Adjust parameters like traffic and instances to simulate real-world scenarios and get immediate, jargon-free feedback.
- **Educational Narration**: Get plain-English explanations of how changes affect performance, along with practical suggestions.
- **Detailed Math Breakdown**: Understand the underlying calculations of the simulation with step-by-step formulas and breakdowns.
- **Developer-Ready Export**: Export your designs as human-readable specifications (JSON) and developer-friendly requirements (Markdown) for easy implementation.
- **Automatic Saving**: Your canvas changes are automatically saved in the background.
- **Enhanced Canvas UI**: Enjoy a cleaner, more intuitive canvas experience with a floating, compact control panel and a resizable, IDE-like chat window.

## Getting Started

Follow these steps to get CanvasTutor up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/CanvasTutor.git
    cd CanvasTutor
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up OpenRouter API Key:**
    CanvasTutor uses the OpenRouter API for AI-powered features (component generation and narration).
    
    a. Get your API Key from [OpenRouter](https://openrouter.ai/)
    b. Create a `.env` file in the root of the project and add your API key:
    ```
    VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
    ```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## Example Usage

### Example 1: Basic Social Media App

**User Input:**
"I want to build a social media app where users can post photos and comment on them."

**Expected Output (Components):**
- User Authentication
- Database
- Photo Storage
- Backend API
- Frontend

**Simulation Scenario:**
- Increase Traffic to 800
- Change Cache to 'large'
- Observe changes in Total Cost, Average Response Time, and Reliability.
- Read the narration for insights and suggestions.

### Example 2: E-commerce Platform

**User Input:**
"An e-commerce website with product listings, shopping cart, and payment processing. I prefer using serverless technologies."

**Expected Output (Components):**
- Product Catalog Service
- Shopping Cart Service
- Payment Gateway
- User Management
- Database
- Frontend

**Simulation Scenario:**
- Change Instances to 10
- Toggle Vendor to 'DIY'
- Observe the impact on system metrics and review the math breakdown.

## Project Structure

```
. (project root)
├── public/
├── src/
│   ├── assets/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Canvas.tsx
│   │   ├── Chatbot.tsx
│   │   ├── ComponentCard.tsx
│   │   ├── ControlsPanel.tsx
│   │   ├── CustomNode.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ExportPanel.tsx
│   │   ├── FloatingHeader.tsx # New: Floating header for canvas page
│   │   ├── InputPrompt.tsx
│   │   └── ResizablePanel.tsx  # New: Resizable panel for chat window
│   ├── context/            # React Context for global state
│   │   └── AppStateContext.tsx
│   ├── lib/                # Utility functions
│   │   └── utils.ts
│   ├── pages/              # Top-level page components
│   ├── services/           # Business logic services
│   │   ├── ComponentExtractorService.ts
│   │   ├── ExportService.ts
│   │   ├── NarrationService.ts
│   │   └── SimulationService.ts
│   └── types/              # TypeScript type definitions
│       └── index.ts
├── tests/
│   ├── e2e/                # End-to-end tests (Playwright)
│   └── unit/               # Unit tests (Vitest)
├── .env                    # Environment variables (e.g., API keys)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── ... (other config files)
```

## Contributing

Contributions are welcome! Please see the `CONTRIBUTING.md` for guidelines.

## License

This project is licensed under the MIT License.