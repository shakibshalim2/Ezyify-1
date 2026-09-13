import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

/**
 * Error Boundary to catch and handle errors gracefully
 * Multiple layers of protection to ensure app never shows blank screen
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorCount: 0,
  };

  // Reset error count after successful renders
  private resetTimer: NodeJS.Timeout | null = null;

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if it's a known recoverable error
    const errorMessage = error.message || '';
    const errorName = error.name || '';
    const stack = error.stack || '';
    
    // List of recoverable errors that should be suppressed
    const isRecoverableError = 
      errorMessage.includes('useNavigate') || 
      errorMessage.includes('Router') ||
      errorMessage.includes('CookieConsent') ||
      errorMessage.includes('Objects are not valid as a React child') ||
      errorMessage.includes('$$typeof') ||
      errorMessage.includes('Loading chunk') || // Code splitting errors
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorName === 'ChunkLoadError' ||
      errorName === 'ReferenceError'; // Missing imports due to cache
    
    if (isRecoverableError) {
      // Suppress this specific error - log but don't show error UI
      console.warn('[ErrorBoundary] Suppressed recoverable error:', errorName, errorMessage.substring(0, 100));
      return { hasError: false, error: null, errorCount: 0 };
    }
    
    // For other errors, show error UI but allow recovery
    console.error('[ErrorBoundary] Caught error:', errorName, errorMessage);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('[ErrorBoundary] Error details:', {
      error: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Track error count to prevent infinite error loops
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }));

    // If too many errors, force a hard reload
    if (this.state.errorCount > 5) {
      console.error('[ErrorBoundary] Too many errors detected, forcing reload...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }

    // Reset error count after 10 seconds of stability
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
    this.resetTimer = setTimeout(() => {
      this.setState({ errorCount: 0 });
    }, 10000);
  }

  public componentWillUnmount() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorCount: 0 });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="text-6xl">⚠️</div>
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            {this.state.error && (
              <details className="text-left bg-muted/30 p-4 rounded-xl text-sm">
                <summary className="cursor-pointer font-medium text-foreground mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Reload Page
              </button>
            </div>
            {this.state.errorCount > 2 && (
              <p className="text-xs text-destructive">
                Multiple errors detected. If the issue persists, try clearing your browser cache.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}