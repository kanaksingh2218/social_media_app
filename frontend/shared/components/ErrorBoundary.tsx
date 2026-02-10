'use client';

import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('🚨 Error caught by boundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
                    <div className="max-w-md w-full bg-[var(--surface)] rounded-lg p-6 text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">
                            Something went wrong
                        </h1>
                        <p className="text-[var(--text-secondary)] mb-4">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className="text-left mb-4 text-xs bg-[var(--background)] p-3 rounded overflow-auto max-h-40">
                                <summary className="cursor-pointer font-semibold mb-2">
                                    Error Details
                                </summary>
                                <pre className="whitespace-pre-wrap">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
