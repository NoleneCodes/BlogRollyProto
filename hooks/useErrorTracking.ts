
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { errorTracker, trackUserAction, trackFormSubmission, ErrorContext } from '../lib/error-tracking';

export const useErrorTracking = (componentName?: string) => {
  const router = useRouter();

  useEffect(() => {
    if (componentName) {
      errorTracker.addBreadcrumb(
        `Component rendered: ${componentName}`,
        'component',
        'info'
      );
    }
  }, [componentName]);

  const captureError = useCallback((error: Error, context?: Partial<ErrorContext>) => {
    errorTracker.captureError(error, {
      component: componentName,
      route: router.pathname,
      ...context,
    });
  }, [componentName, router.pathname]);

  const captureMessage = useCallback((message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Partial<ErrorContext>) => {
    errorTracker.captureMessage(message, level, {
      component: componentName,
      route: router.pathname,
      ...context,
    });
  }, [componentName, router.pathname]);

  const trackAction = useCallback((action: string, metadata?: Record<string, any>) => {
    trackUserAction(action, componentName || 'unknown', undefined, metadata);
  }, [componentName]);

  const trackForm = useCallback((formName: string, success: boolean, errors?: string[]) => {
    trackFormSubmission(formName, success, undefined, errors);
  }, []);

  const startPerformanceTimer = useCallback((operationName: string) => {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      errorTracker.trackPerformance(`${componentName}: ${operationName}`, duration, {
        component: componentName,
        route: router.pathname,
      });
    };
  }, [componentName, router.pathname]);

  return {
    captureError,
    captureMessage,
    trackAction,
    trackForm,
    startPerformanceTimer,
  };
};
