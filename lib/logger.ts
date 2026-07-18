/**
 * Simple structured logger.
 * In production, only warn+error are emitted.
 * In development, all levels are emitted.
 *
 * Format: [timestamp] [level] [module] message
 */

type LogLevel = "info" | "warn" | "error" | "debug";

function formatTimestamp(): string {
  return new Date().toISOString();
}

function emit(level: LogLevel, module: string, message: string, data?: Record<string, unknown>): void {
  const ts = formatTimestamp();
  const prefix = `[${ts}] [${level}] [${module}]`;
  const extra = data ? " " + JSON.stringify(data) : "";

  if (level === "error") {
    console.error(`${prefix} ${message}${extra}`);
  } else if (level === "warn") {
    console.warn(`${prefix} ${message}${extra}`);
  } else if (process.env.NODE_ENV !== "production") {
    console.log(`${prefix} ${message}${extra}`);
  }
}

function createLogger(module: string) {
  return {
    info(message: string, data?: Record<string, unknown>) {
      emit("info", module, message, data);
    },
    warn(message: string, data?: Record<string, unknown>) {
      emit("warn", module, message, data);
    },
    error(message: string, data?: Record<string, unknown>) {
      emit("error", module, message, data);
    },
    debug(message: string, data?: Record<string, unknown>) {
      emit("debug", module, message, data);
    },
  };
}

export const logger = {
  create: createLogger,
};
