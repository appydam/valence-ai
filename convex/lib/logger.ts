/**
 * Structured logger for Convex functions.
 *
 * Wraps console.log/warn/error with JSON-structured output for easier
 * parsing in production log aggregators (Datadog, CloudWatch, etc.).
 *
 * Usage:
 *   import { logger } from "./lib/logger";
 *   const log = logger("heartbeat");
 *   log.info("Agent checked in", { agentName: "kaze", taskId: "abc123" });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  [key: string]: unknown;
}

function formatEntry(
  level: LogLevel,
  component: string,
  message: string,
  data?: Record<string, unknown>
): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    component,
    message,
    ...data,
  };
  return JSON.stringify(entry);
}

interface Logger {
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, data?: Record<string, unknown>) => void;
}

/**
 * Create a structured logger scoped to a component.
 *
 * @param component - Name of the component (e.g. "heartbeat", "sshProxy", "integrationEngine")
 */
export function logger(component: string): Logger {
  return {
    debug: (message, data) => console.log(formatEntry("debug", component, message, data)),
    info: (message, data) => console.log(formatEntry("info", component, message, data)),
    warn: (message, data) => console.warn(formatEntry("warn", component, message, data)),
    error: (message, data) => console.error(formatEntry("error", component, message, data)),
  };
}
