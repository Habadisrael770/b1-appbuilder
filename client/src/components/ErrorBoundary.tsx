import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Component, ReactNode } from "react";
import { useLocation } from "wouter";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error);
      console.error("Error info:", errorInfo);
    }

    // Increment error count
    this.setState((prevState) => ({
      errorCount: prevState.errorCount + 1,
    }));

    // You could send this to an error tracking service like Sentry
    // Example:
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === "development";

      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 bg-white rounded-2xl shadow-lg">
            {/* Error Icon */}
            <div className="p-4 rounded-full bg-red-100 mb-6">
              <AlertTriangle size={48} className="text-red-600" />
            </div>

            {/* Error Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 text-center mb-6">
              We're sorry for the inconvenience. Our team has been notified and
              we're working on a fix.
            </p>

            {/* Error Details (Development Only) */}
            {isDevelopment && this.state.error && (
              <div className="w-full mb-6">
                <details className="bg-gray-100 rounded-lg p-4 text-left">
                  <summary className="cursor-pointer font-semibold text-gray-900 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Message:
                      </p>
                      <pre className="text-xs text-gray-600 bg-white p-2 rounded overflow-auto max-h-32">
                        {this.state.error.message}
                      </pre>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Stack:
                      </p>
                      <pre className="text-xs text-gray-600 bg-white p-2 rounded overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            )}

            {/* Error Count Warning */}
            {this.state.errorCount > 2 && (
              <div className="w-full mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Multiple errors detected ({this.state.errorCount}). If this
                  persists, please clear your browser cache or try a different
                  browser.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 w-full flex-wrap justify-center">
              <button
                onClick={this.handleReset}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold",
                  "bg-[#00A86B] text-white hover:bg-[#008556]",
                  "transition-colors active:scale-95"
                )}
              >
                <RotateCcw size={18} />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold",
                  "bg-gray-200 text-gray-900 hover:bg-gray-300",
                  "transition-colors active:scale-95"
                )}
              >
                <Home size={18} />
                Go Home
              </button>

              <button
                onClick={this.handleReload}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold",
                  "bg-gray-100 text-gray-900 hover:bg-gray-200",
                  "transition-colors active:scale-95"
                )}
              >
                <RotateCcw size={18} />
                Reload Page
              </button>
            </div>

            {/* Support Link */}
            <p className="text-center text-gray-600 text-sm mt-6">
              Need help?{" "}
              <a
                href="#"
                className="text-[#00A86B] hover:text-[#008556] font-semibold"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
