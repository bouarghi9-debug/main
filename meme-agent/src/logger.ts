type Level = 'debug' | 'info' | 'warn' | 'error';

function ts(): string {
  return new Date().toISOString();
}

function line(level: Level, scope: string, msg: string, extra?: unknown): void {
  const base = `${ts()} [${level.toUpperCase()}] [${scope}] ${msg}`;
  if (extra !== undefined) {
    // eslint-disable-next-line no-console
    console.log(base, typeof extra === 'string' ? extra : JSON.stringify(extra));
  } else {
    // eslint-disable-next-line no-console
    console.log(base);
  }
}

export function createLogger(scope: string) {
  return {
    debug: (msg: string, extra?: unknown) => line('debug', scope, msg, extra),
    info: (msg: string, extra?: unknown) => line('info', scope, msg, extra),
    warn: (msg: string, extra?: unknown) => line('warn', scope, msg, extra),
    error: (msg: string, extra?: unknown) => line('error', scope, msg, extra),
  };
}

export type Logger = ReturnType<typeof createLogger>;
