type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

const safeJsonStringify = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ error: "unstringifiable_log_payload" });
  }
};

const writeLog = (level: LogLevel, message: string, context?: LogContext) => {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {}),
  };

  // eslint-disable-next-line no-console
  const logger = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  logger(safeJsonStringify(payload));
};

export const log = {
  debug: (message: string, context?: LogContext) => writeLog("debug", message, context),
  info: (message: string, context?: LogContext) => writeLog("info", message, context),
  warn: (message: string, context?: LogContext) => writeLog("warn", message, context),
  error: (message: string, context?: LogContext) => writeLog("error", message, context),
};


