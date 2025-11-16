// Performance monitoring utility for enterprise applications
import { GoogleAnalytics } from './analytics';

export interface PerformanceMetrics {
  loadTime: number;
  domInteractive: number;
  domComplete: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();
  private static observers: Map<string, PerformanceObserver> = new Map();

  /**
   * Initialize performance monitoring
   */
  static initialize() {
    if (typeof window === 'undefined') return;

    // Monitor navigation timing
    this.monitorNavigationTiming();
    
    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
    
    // Monitor resource loading
    this.monitorResourceTiming();
    
    // Start custom performance tracking
    this.startCustomTracking();
  }

  /**
   * Monitor navigation timing metrics
   */
  private static monitorNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            const metrics: PerformanceMetrics = {
              loadTime: navigation.loadEventEnd - navigation.startTime,
              domInteractive: navigation.domInteractive - navigation.startTime,
              domComplete: navigation.domComplete - navigation.startTime
            };

            // Track metrics in analytics
            GoogleAnalytics.trackPerformance('page_load_time', metrics.loadTime);
            GoogleAnalytics.trackPerformance('dom_interactive', metrics.domInteractive);
            GoogleAnalytics.trackPerformance('dom_complete', metrics.domComplete);

            console.log('Navigation Performance Metrics:', metrics);
          }
        }, 0);
      });
    }
  }

  /**
   * Monitor Core Web Vitals
   */
  private static monitorCoreWebVitals() {
    // First Contentful Paint (FCP)
    this.observePerformanceEntry('paint', (entries) => {
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          GoogleAnalytics.trackPerformance('first_contentful_paint', entry.startTime);
          this.metrics.set('fcp', entry.startTime);
        }
      });
    });

    // Largest Contentful Paint (LCP)
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        GoogleAnalytics.trackPerformance('largest_contentful_paint', lastEntry.startTime);
        this.metrics.set('lcp', lastEntry.startTime);
      }
    });

    // Cumulative Layout Shift (CLS)
    this.observePerformanceEntry('layout-shift', (entries) => {
      let clsScore = 0;
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      if (clsScore > 0) {
        GoogleAnalytics.trackPerformance('cumulative_layout_shift', clsScore);
        this.metrics.set('cls', clsScore);
      }
    });

    // First Input Delay (FID)
    this.observePerformanceEntry('first-input', (entries) => {
      const firstInput = entries[0] as any; // PerformanceEventTiming
      if (firstInput && firstInput.processingStart) {
        const fid = firstInput.processingStart - firstInput.startTime;
        GoogleAnalytics.trackPerformance('first_input_delay', fid);
        this.metrics.set('fid', fid);
      }
    });
  }

  /**
   * Monitor resource loading performance
   */
  private static monitorResourceTiming() {
    this.observePerformanceEntry('resource', (entries) => {
      entries.forEach((entry) => {
        const resourceEntry = entry as PerformanceResourceTiming;
        // Monitor slow resources (>1s)
        const loadTime = resourceEntry.responseEnd - resourceEntry.startTime;
        if (loadTime > 1000) {
          GoogleAnalytics.trackPerformance('slow_resource_load', loadTime);
        }

        // Track API call performance
        if (resourceEntry.name.includes('api') || resourceEntry.name.includes('amazonaws')) {
          GoogleAnalytics.trackPerformance('api_resource_time', loadTime);
        }
      });
    });
  }

  /**
   * Helper to observe performance entries
   */
  private static observePerformanceEntry(
    type: string, 
    callback: (entries: PerformanceEntry[]) => void
  ) {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries());
        });
        
        observer.observe({ type, buffered: true });
        this.observers.set(type, observer);
      } catch (e) {
        console.warn(`Performance observer for ${type} not supported`);
      }
    }
  }

  /**
   * Start custom performance tracking
   */
  private static startCustomTracking() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        GoogleAnalytics.trackEngagement('page_hidden');
      } else {
        GoogleAnalytics.trackEngagement('page_visible');
      }
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track scroll milestones
        if ([25, 50, 75, 100].includes(scrollDepth)) {
          GoogleAnalytics.trackEngagement('scroll_depth', { depth: scrollDepth });
        }
      }
    });
  }

  /**
   * Mark custom performance milestones
   */
  static mark(name: string) {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
    this.metrics.set(name, Date.now());
  }

  /**
   * Measure time between two marks
   */
  static measure(name: string, startMark: string, endMark?: string) {
    if ('performance' in window && 'measure' in performance) {
      try {
        if (endMark) {
          performance.measure(name, startMark, endMark);
        } else {
          performance.measure(name, startMark);
        }
        
        const measure = performance.getEntriesByName(name, 'measure')[0];
        if (measure) {
          GoogleAnalytics.trackPerformance(name, measure.duration);
          return measure.duration;
        }
      } catch (e) {
        console.warn(`Performance measure failed: ${e}`);
      }
    }
    
    // Fallback measurement
    const startTime = this.metrics.get(startMark);
    const endTime = endMark ? this.metrics.get(endMark) : Date.now();
    
    if (startTime && endTime) {
      const duration = endTime - startTime;
      GoogleAnalytics.trackPerformance(name, duration);
      return duration;
    }
    
    return 0;
  }

  /**
   * Track component render performance
   */
  static trackComponentRender(componentName: string, renderTime: number) {
    GoogleAnalytics.trackPerformance(`component_render_${componentName}`, renderTime);
    
    // Warn about slow components (>100ms)
    if (renderTime > 100) {
      console.warn(`Slow component render: ${componentName} took ${renderTime}ms`);
    }
  }

  /**
   * Track API call performance with detailed metrics
   */
  static async trackApiCall<T>(
    url: string,
    request: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.mark(`api-start-${url}`);
    
    try {
      const result = await request();
      const duration = Date.now() - startTime;
      
      GoogleAnalytics.trackAPICall(url, true, duration);
      GoogleAnalytics.trackPerformance('api_success_time', duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      GoogleAnalytics.trackAPICall(url, false, duration);
      GoogleAnalytics.trackPerformance('api_error_time', duration);
      
      throw error;
    }
  }

  /**
   * Get current performance metrics
   */
  static getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  /**
   * Clear performance observers (cleanup)
   */
  static cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
    this.metrics.clear();
  }

  /**
   * Generate performance report
   */
  static generateReport(): PerformanceMetrics & { [key: string]: number } {
    const report: any = {
      loadTime: this.metrics.get('loadTime') || 0,
      domInteractive: this.metrics.get('domInteractive') || 0,
      domComplete: this.metrics.get('domComplete') || 0,
      firstContentfulPaint: this.metrics.get('fcp'),
      largestContentfulPaint: this.metrics.get('lcp'),
      firstInputDelay: this.metrics.get('fid'),
      cumulativeLayoutShift: this.metrics.get('cls')
    };

    // Add custom metrics
    this.metrics.forEach((value, key) => {
      if (!report[key]) {
        report[key] = value;
      }
    });

    return report;
  }
}

// Initialize performance monitoring when module loads
if (typeof window !== 'undefined') {
  PerformanceMonitor.initialize();
}

export default PerformanceMonitor;