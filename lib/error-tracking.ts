
import * as Sentry from '@sentry/nextjs';

export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  route?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class ErrorTracker {
  private isInitialized = false;

  constructor() {
    this.isInitialized = !!process.env.NEXT_PUBLIC_SENTRY_DSN;
  }

  // Set user context for error tracking
  setUser(userId: string, email?: string, role?: string) {
    if (!this.isInitialized) return;

    Sentry.setUser({
      id: userId,
      email: email,
      role: role,
    });
  }

  // Clear user context (on logout)
  clearUser() {
    if (!this.isInitialized) return;
    Sentry.setUser(null);
  }

  // Set additional context
  setContext(key: string, context: Record<string, any>) {
    if (!this.isInitialized) return;
    Sentry.setContext(key, context);
  }

  // Add breadcrumb for tracking user actions
  addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info', data?: Record<string, any>) {
    if (!this.isInitialized) {
      console.log(`[BREADCRUMB] ${category}: ${message}`, data);
      return;
    }

    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  }

  // Track errors with context
  captureError(error: Error, context?: ErrorContext) {
    console.error('Error captured:', error, context);

    if (!this.isInitialized) {
      return;
    }

    Sentry.withScope((scope) => {
      if (context) {
        if (context.userId) scope.setUser({ id: context.userId });
        if (context.route) scope.setTag('route', context.route);
        if (context.component) scope.setTag('component', context.component);
        if (context.action) scope.setTag('action', context.action);
        if (context.metadata) scope.setContext('metadata', context.metadata);
      }

      scope.setLevel('error');
      Sentry.captureException(error);
    });
  }

  // Track API errors specifically
  captureAPIError(error: Error, endpoint: string, method: string, statusCode?: number, userId?: string) {
    this.addBreadcrumb(`API Error: ${method} ${endpoint}`, 'api', 'error', {
      endpoint,
      method,
      statusCode,
    });

    this.captureError(error, {
      userId,
      route: endpoint,
      action: `api_${method.toLowerCase()}`,
      metadata: {
        endpoint,
        method,
        statusCode,
      },
    });
  }

  // Track authentication errors
  captureAuthError(error: Error, action: string, email?: string) {
    this.addBreadcrumb(`Auth Error: ${action}`, 'auth', 'error', { action, email });

    this.captureError(error, {
      userEmail: email,
      action: `auth_${action}`,
      component: 'authentication',
      metadata: { action, email },
    });
  }

  // Track payment errors
  capturePaymentError(error: Error, userId: string, amount?: number, currency?: string) {
    this.addBreadcrumb('Payment Error', 'payment', 'error', { amount, currency });

    this.captureError(error, {
      userId,
      action: 'payment_failed',
      component: 'stripe',
      metadata: { amount, currency },
    });
  }

  // Track custom events/messages
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    console.log(`[${level.toUpperCase()}] ${message}`, context);

    if (!this.isInitialized) return;

    Sentry.withScope((scope) => {
      if (context) {
        if (context.userId) scope.setUser({ id: context.userId });
        if (context.route) scope.setTag('route', context.route);
        if (context.component) scope.setTag('component', context.component);
        if (context.action) scope.setTag('action', context.action);
        if (context.metadata) scope.setContext('metadata', context.metadata);
      }

      scope.setLevel(level);
      Sentry.captureMessage(message);
    });
  }

  // Performance monitoring
  startTransaction(name: string, op: string) {
    if (!this.isInitialized) return null;
    return Sentry.startTransaction({ name, op });
  }

  // Track performance metrics
  trackPerformance(name: string, duration: number, context?: Record<string, any>) {
    this.addBreadcrumb(`Performance: ${name}`, 'performance', 'info', {
      duration,
      ...context,
    });

    if (this.isInitialized) {
      Sentry.addBreadcrumb({
        message: `Performance: ${name}`,
        category: 'performance',
        data: { duration, ...context },
        level: 'info',
      });
    }
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();

// Utility functions for common error scenarios
export const trackPageView = (route: string, userId?: string) => {
  errorTracker.addBreadcrumb(`Page view: ${route}`, 'navigation', 'info', { route });
  if (userId) {
    errorTracker.setContext('page', { route, userId });
  }
};

export const trackUserAction = (action: string, component: string, userId?: string, metadata?: Record<string, any>) => {
  errorTracker.addBreadcrumb(`User action: ${action}`, 'user', 'info', {
    component,
    action,
    ...metadata,
  });
};

export const trackFormSubmission = (formName: string, success: boolean, userId?: string, errors?: string[]) => {
  errorTracker.addBreadcrumb(
    `Form submission: ${formName}`,
    'form',
    success ? 'info' : 'warning',
    { formName, success, errors }
  );

  if (!success && errors?.length) {
    errorTracker.captureMessage(
      `Form validation failed: ${formName}`,
      'warning',
      {
        userId,
        component: 'form',
        action: 'form_validation_failed',
        metadata: { formName, errors },
      }
    );
  }
};
