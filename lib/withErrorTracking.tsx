
import React, { Component, ComponentType } from 'react';
import { errorTracker, ErrorContext } from './error-tracking';

interface ErrorTrackingState {
  hasError: boolean;
}

interface WithErrorTrackingProps {
  errorContext?: Partial<ErrorContext>;
}

export function withErrorTracking<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName?: string
) {
  return class WithErrorTracking extends Component<P & WithErrorTrackingProps, ErrorTrackingState> {
    private componentName: string;

    constructor(props: P & WithErrorTrackingProps) {
      super(props);
      this.state = { hasError: false };
      this.componentName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
    }

    static getDerivedStateFromError(): ErrorTrackingState {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      const { errorContext } = this.props;
      
      errorTracker.captureError(error, {
        component: this.componentName,
        action: 'component_error',
        ...errorContext,
        metadata: {
          componentStack: errorInfo.componentStack,
          ...errorContext?.metadata,
        },
      });
    }

    componentDidMount() {
      errorTracker.addBreadcrumb(
        `Component mounted: ${this.componentName}`,
        'component',
        'info'
      );
    }

    componentWillUnmount() {
      errorTracker.addBreadcrumb(
        `Component unmounted: ${this.componentName}`,
        'component',
        'info'
      );
    }

    render() {
      if (this.state.hasError) {
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Something went wrong in {this.componentName}</h3>
            <button onClick={() => this.setState({ hasError: false })}>
              Try Again
            </button>
          </div>
        );
      }

      const { errorContext, ...restProps } = this.props;
      return <WrappedComponent {...(restProps as P)} />;
    }
  };
}
