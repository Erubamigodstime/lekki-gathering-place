// Error tracking and monitoring utilities
// TODO: Install Sentry: npm install @sentry/react

interface ErrorEvent {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
}

class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private maxErrors = 50;

  logError(error: Error, errorInfo?: { componentStack?: string }) {
    const errorEvent: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.errors.push(errorEvent);
    
    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error tracked:', errorEvent);
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // this.sendToSentry(errorEvent);
  }

  getErrors() {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }

  // Placeholder for future Sentry integration
  private sendToSentry(errorEvent: ErrorEvent) {
    // Implementation when Sentry is installed
    // Sentry.captureException(new Error(errorEvent.message), {
    //   contexts: {
    //     errorInfo: {
    //       stack: errorEvent.stack,
    //       componentStack: errorEvent.componentStack,
    //     },
    //   },
    // });
  }
}

// Analytics tracking
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

class Analytics {
  trackEvent(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date(),
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('Analytics event:', analyticsEvent);
    }

    // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
    // gtag('event', event, properties);
  }

  trackPageView(path: string) {
    this.trackEvent('page_view', { path });
  }

  trackInstructorView(instructorId: string, instructorName: string) {
    this.trackEvent('instructor_profile_viewed', {
      instructor_id: instructorId,
      instructor_name: instructorName,
    });
  }

  trackEnrollmentClick(instructorId: string) {
    this.trackEvent('enroll_button_clicked', {
      instructor_id: instructorId,
    });
  }
}

// Performance monitoring
class PerformanceMonitor {
  measurePageLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          download: navigation.responseEnd - navigation.responseStart,
          domInteractive: navigation.domInteractive - navigation.fetchStart,
          domComplete: navigation.domComplete - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        };

        if (import.meta.env.DEV) {
          console.table(metrics);
        }

        // TODO: Send to monitoring service
        return metrics;
      }
    }
  }

  measureComponentRender(componentName: string, duration: number) {
    if (import.meta.env.DEV) {
      console.log(`${componentName} rendered in ${duration}ms`);
    }
    
    // TODO: Send to monitoring service
  }
}

// Export singleton instances
export const errorTracker = new ErrorTracker();
export const analytics = new Analytics();
export const performanceMonitor = new PerformanceMonitor();

// Hook for React components
export function useAnalytics() {
  return analytics;
}

export function useErrorTracking() {
  return errorTracker;
}

export function usePerformanceMonitoring() {
  return performanceMonitor;
}
