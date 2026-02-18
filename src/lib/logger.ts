type LogData = Record<string, unknown>;

const isDev = process.env.NODE_ENV === "development";

const formatEntry = (level: string, message: string, data?: LogData): string => {
  if (isDev) {
    const extra = data ? ` ${JSON.stringify(data)}` : "";
    return `[${level.toUpperCase()}] ${message}${extra}`;
  }
  return JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  });
};

export const logger = {
  info: (message: string, data?: LogData) => {
    console.log(formatEntry("info", message, data));
  },
  warn: (message: string, data?: LogData) => {
    console.warn(formatEntry("warn", message, data));
  },
  error: (message: string, error?: unknown, data?: LogData) => {
    const errData: LogData = { ...data };
    if (error instanceof Error) {
      errData.error = error.message;
      errData.stack = error.stack;
    } else if (error !== undefined) {
      errData.error = String(error);
    }
    console.error(formatEntry("error", message, errData));
  },
};
