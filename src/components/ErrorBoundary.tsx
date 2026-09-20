/**
 * Error Boundary Component
 * Catches and handles React errors gracefully
 */

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05070B] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#E8F1FF] mb-4">
                SOMETHING INTERRUPTED THE ARCHIVE.
              </h1>
              <p className="text-[#94A3B8] text-lg mb-2">
                The memories are still here.
              </p>
              {this.state.error && (
                <p className="text-sm text-[#94A3B8] mt-4 font-mono">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
