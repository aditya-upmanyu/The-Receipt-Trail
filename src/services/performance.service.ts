/**
 * Performance Monitoring Service
 * Tracks performance metrics and provides insights
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();

  /**
   * Start a performance measurement
   */
  startMeasure(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * End a performance measurement
   */
  endMeasure(name: string, metadata?: Record<string, unknown>): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date(),
      metadata,
    };

    this.metrics.push(metric);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Measure a function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.startMeasure(name);
    try {
      const result = await fn();
      this.endMeasure(name, metadata);
      return result;
    } catch (error) {
      this.endMeasure(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Measure synchronous function
   */
  measure<T>(name: string, fn: () => T, metadata?: Record<string, unknown>): T {
    this.startMeasure(name);
    try {
      const result = fn();
      this.endMeasure(name, metadata);
      return result;
    } catch (error) {
      this.endMeasure(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * Get average duration for a metric
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Get slowest operations
   */
  getSlowestOperations(limit = 10): PerformanceMetric[] {
    return [...this.metrics].sort((a, b) => b.duration - a.duration).slice(0, limit);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; avg: number; max: number; min: number }> {
    const summary: Record<string, { count: number; avg: number; max: number; min: number }> = {};

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          avg: 0,
          max: 0,
          min: Infinity,
        };
      }

      const s = summary[metric.name];
      s.count++;
      s.max = Math.max(s.max, metric.duration);
      s.min = Math.min(s.min, metric.duration);
    });

    // Calculate averages
    Object.keys(summary).forEach((name) => {
      summary[name].avg = this.getAverageDuration(name);
    });

    return summary;
  }

  /**
   * Report Web Vitals (CLS, FID, LCP)
   */
  reportWebVitals(): void {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number };
        console.log("[LCP]", lastEntry.startTime || lastEntry.renderTime);
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          console.log("[FID]", fidEntry.processingStart - fidEntry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!layoutShift.hadRecentInput) {
            clsScore += layoutShift.value || 0;
          }
        });
        console.log("[CLS]", clsScore);
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (error) {
      console.warn("Web Vitals monitoring not supported", error);
    }
  }
}

// Singleton instance
export const performanceService = new PerformanceService();

// Start web vitals monitoring
if (typeof window !== "undefined") {
  performanceService.reportWebVitals();
}

export type PerformanceServiceType = PerformanceService;
