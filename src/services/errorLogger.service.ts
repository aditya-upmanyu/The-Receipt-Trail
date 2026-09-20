/**
 * Error Logging Service
 * Centralized error handling and logging
 */

export const ErrorSeverity = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type ErrorSeverity = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

export interface ErrorLog {
  timestamp: Date;
  message: string;
  severity: ErrorSeverity;
  stack?: string;
  context?: Record<string, unknown>;
}

class ErrorLoggerService {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  /**
   * Log an error with context
   */
  logError(
    error: Error | string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, unknown>
  ): void {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      message: error instanceof Error ? error.message : error,
      severity,
      stack: error instanceof Error ? error.stack : undefined,
      context,
    };

    this.logs.push(errorLog);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging based on severity
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      console.error("[ERROR]", errorLog);
    } else if (severity === ErrorSeverity.MEDIUM) {
      console.warn("[WARN]", errorLog);
    } else {
      console.log("[INFO]", errorLog);
    }

    // In production, you could send to external service (Sentry, LogRocket, etc.)
    this.reportToExternalService(errorLog);
  }

  /**
   * Get all error logs
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Get logs by severity
   */
  getLogsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.logs.filter((log) => log.severity === severity);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get error statistics
   */
  getStats(): Record<ErrorSeverity, number> {
    return {
      [ErrorSeverity.LOW]: this.getLogsBySeverity(ErrorSeverity.LOW).length,
      [ErrorSeverity.MEDIUM]: this.getLogsBySeverity(ErrorSeverity.MEDIUM).length,
      [ErrorSeverity.HIGH]: this.getLogsBySeverity(ErrorSeverity.HIGH).length,
      [ErrorSeverity.CRITICAL]: this.getLogsBySeverity(ErrorSeverity.CRITICAL).length,
    };
  }

  /**
   * Report to external service (stub for now)
   */
  private reportToExternalService(errorLog: ErrorLog): void {
    // In production, integrate with Sentry, LogRocket, etc.
    if (typeof window !== "undefined" && errorLog.severity === ErrorSeverity.CRITICAL) {
      try {
        const stored = localStorage.getItem("error_logs") || "[]";
        const logs = JSON.parse(stored);
        logs.push(errorLog);
        localStorage.setItem("error_logs", JSON.stringify(logs.slice(-20)));
      } catch {
        // Ignore localStorage errors
      }
    }
  }
}

// Singleton instance
export const errorLogger = new ErrorLoggerService();

// Export type for testing
export type ErrorLoggerServiceType = ErrorLoggerService;
