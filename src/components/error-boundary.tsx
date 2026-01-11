'use client';

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  static getDerivedStateFromProps(
    props: React.PropsWithChildren<{}>,
    state: ErrorBoundaryState
  ): ErrorBoundaryState {
    return state;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-neutral-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <details className="text-start">
                <summary className="cursor-pointer text-sm font-medium text-neutral-700">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-neutral-500 overflow-auto">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
