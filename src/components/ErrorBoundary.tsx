import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  errorType?: string; // Optional: to identify the type of error boundary
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const USER_FRIENDLY_MESSAGES: { [key: string]: string } = {
  CanvasError: "There was an issue rendering the canvas. Please try reloading the page.",
  SimulationError: "A problem occurred during simulation. Please check your inputs or try again later.",
  ComponentExtractionError: "We couldn't generate components based on your description. Please try a different input.",
  // Add more error types and messages as needed
  DefaultError: "An unexpected error occurred. Please try again or contact support.",
};

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const userMessage = this.props.errorType
        ? USER_FRIENDLY_MESSAGES[this.props.errorType] || USER_FRIENDLY_MESSAGES.DefaultError
        : USER_FRIENDLY_MESSAGES.DefaultError;

      return (
        <div style={{ padding: '20px', border: '1px solid red', color: 'red' }}>
          <h2>{userMessage}</h2>
          {/* Optionally show details in development or with a toggle */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error.toString()}
              <br />
              {this.state.error.stack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
