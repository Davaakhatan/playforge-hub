type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatLog(entry: LogEntry): string {
  const { level, message, timestamp, context } = entry;
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    if (!shouldLog('debug')) return;
    const entry = createLogEntry('debug', message, context);
    console.debug(formatLog(entry));
  },

  info(message: string, context?: Record<string, unknown>) {
    if (!shouldLog('info')) return;
    const entry = createLogEntry('info', message, context);
    console.info(formatLog(entry));
  },

  warn(message: string, context?: Record<string, unknown>) {
    if (!shouldLog('warn')) return;
    const entry = createLogEntry('warn', message, context);
    console.warn(formatLog(entry));
  },

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    if (!shouldLog('error')) return;
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack,
      }),
    };
    const entry = createLogEntry('error', message, errorContext);
    console.error(formatLog(entry));
  },

  request(method: string, path: string, statusCode: number, durationMs: number) {
    this.info(`${method} ${path} ${statusCode}`, { durationMs });
  },
};

export function withLogging<T>(
  handler: (req: Request) => Promise<T>
): (req: Request) => Promise<T> {
  return async (req: Request) => {
    const start = Date.now();
    const url = new URL(req.url);

    try {
      const result = await handler(req);
      const duration = Date.now() - start;

      if (result instanceof Response) {
        logger.request(req.method, url.pathname, result.status, duration);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`Request failed: ${req.method} ${url.pathname}`, error, { duration });
      throw error;
    }
  };
}
