import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GoogleAnalytics } from '../utils/analytics';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Track error in analytics
    GoogleAnalytics.trackError(error, 'error_boundary');
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external error tracking service (Sentry, etc.)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // This would integrate with Sentry, Rollbar, or similar service
    console.error('Logging error to external service:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReportError = () => {
    const { error } = this.state;
    if (error) {
      // Open email client with error details
      const subject = encodeURIComponent('Stock Dashboard Error Report');
      const body = encodeURIComponent(`
        Error occurred in Stock Dashboard:
        
        Error: ${error.message}
        Stack: ${error.stack}
        Time: ${new Date().toISOString()}
        URL: ${window.location.href}
        User Agent: ${navigator.userAgent}
      `);
      
      window.location.href = `mailto:support@yourdomain.com?subject=${subject}&body=${body}`;
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            
            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="error-button error-button-primary"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="error-button error-button-secondary"
              >
                Reload Page
              </button>
              <button 
                onClick={this.handleReportError}
                className="error-button error-button-text"
              >
                Report Issue
              </button>
            </div>

            {window.location.hostname === 'localhost' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <pre className="error-component-stack">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;