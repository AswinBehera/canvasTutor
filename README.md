# CanvasTutor: Visualize, Simulate, and Master System Architecture

CanvasTutor is a beginner-friendly, AI-powered application designed to help users visualize, simulate, and understand system architectures. Transform complex ideas into clear, actionable system designs with an intuitive drag-and-drop interface and real-time feedback.

## ✨ Live Demo

**Try CanvasTutor live on Netlify:** [**canvastutor.netlify.app**](https://canvastutor.netlify.app)

## Features

- **AI-Powered Component Generation**: Describe your app in plain language, and our AI suggests core components tailored to your needs.
- **Interactive Canvas**: Visually compose your system on an intuitive canvas, with animated data flows bringing your architecture to life.
- **Real-time Simulation & Insights**: Adjust parameters like traffic and instances to simulate real-world scenarios and get immediate, jargon-free feedback.
- **Educational Narration**: Get plain-English explanations of how changes affect performance, along with practical suggestions.
- **Developer-Ready Export**: Export your designs as human-readable specifications (JSON) and developer-friendly requirements (Markdown) for easy implementation.
- **Automatic Saving**: Your canvas changes are automatically saved in the background.
- **Enhanced Canvas UI**: Enjoy a cleaner, more intuitive canvas experience with a floating, compact control panel and a resizable, IDE-like chat window.

## Getting Started Locally

Follow these steps to get CanvasTutor up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation & Setup

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd SysXPlay
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Application:**
    To start the development server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

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
│   │   └── ...
│   ├── context/            # React Context for global state
│   ├── services/           # Business logic
│   └── types/              # TypeScript type definitions
├── tests/
│   ├── e2e/                # End-to-end tests (Playwright)
│   └── unit/               # Unit tests (Vitest)
├── package.json
├── vite.config.ts
└── ... (other config files)
```

## Contributing

Contributions are welcome! Please see the `CONTRIBUTING.md` for guidelines.

## License

This project is licensed under the MIT License.
