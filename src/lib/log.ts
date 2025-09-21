export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  uuid: string;
  message: string;
  meta?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getCurrentLogLevel(): LogLevel {
  const envLevel = process.env.APP_LOG_LEVEL?.toLowerCase() as LogLevel;
  return LOG_LEVELS[envLevel] !== undefined ? envLevel : 'info';
}

function shouldLog(level: LogLevel): boolean {
  const currentLevel = getCurrentLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function getAnonymousUuid(): string {
  if (typeof window !== 'undefined') {
    return getAnonymousUuidFromCookie();
  } else {
    return getAnonymousUuidFromHeaders();
  }
}

function getAnonymousUuidFromCookie(): string {
  const cookieName = 'anonymous-uuid';
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName && value) {
      return value;
    }
  }

  const newUuid = generateUuid();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  document.cookie = `${cookieName}=${newUuid}; expires=${sixMonthsFromNow.toUTCString()}; path=/; SameSite=Lax`;
  return newUuid;
}

function getAnonymousUuidFromHeaders(): string {
  return 'server-unknown';
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) {
    return;
  }

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    uuid: getAnonymousUuid(),
    message,
    ...(meta && { meta }),
  };

  const logMessage = JSON.stringify(logEntry);

  switch (level) {
    case 'error':
      console.error(logMessage);
      break;
    case 'warn':
      console.warn(logMessage);
      break;
    case 'info':
      console.info(logMessage);
      break;
    case 'debug':
      console.log(logMessage);
      break;
  }
}

export function logError(message: string, meta?: Record<string, unknown>): void {
  log('error', message, meta);
}

export function logWarn(message: string, meta?: Record<string, unknown>): void {
  log('warn', message, meta);
}

export function logInfo(message: string, meta?: Record<string, unknown>): void {
  log('info', message, meta);
}

export function logDebug(message: string, meta?: Record<string, unknown>): void {
  log('debug', message, meta);
}

export function logWithRequest(request: unknown, level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const anonymousUuid = getAnonymousUuidFromRequest(request);

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    uuid: anonymousUuid,
    message,
    ...(meta && { meta }),
  };

  if (!shouldLog(level)) {
    return;
  }

  const logMessage = JSON.stringify(logEntry);

  switch (level) {
    case 'error':
      console.error(logMessage);
      break;
    case 'warn':
      console.warn(logMessage);
      break;
    case 'info':
      console.info(logMessage);
      break;
    case 'debug':
      console.log(logMessage);
      break;
  }
}

function getAnonymousUuidFromRequest(request: unknown): string {
  const cookieName = 'anonymous-uuid';

  if (request && typeof request === 'object') {
    const req = request as { cookies?: { get?: (name: string) => { value?: string } | undefined }; headers?: { get?: (name: string) => string | null } };

    if (req.cookies?.get) {
      const cookie = req.cookies.get(cookieName);
      return cookie?.value || 'server-no-cookie';
    }

    if (req.headers?.get) {
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === cookieName && value) {
            return value;
          }
        }
      }
    }
  }

  return 'server-no-cookie';
}

export function ensureAnonymousUuidCookie(request: unknown, response: unknown): string {
  const cookieName = 'anonymous-uuid';
  const existingUuid = getAnonymousUuidFromRequest(request);

  if (existingUuid !== 'server-no-cookie') {
    return existingUuid;
  }

  const newUuid = generateUuid();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  if (response && typeof response === 'object') {
    const res = response as { cookies?: { set?: (name: string, value: string, options: { expires: Date; path: string; sameSite: string; httpOnly: boolean }) => void } };

    if (res.cookies?.set) {
      res.cookies.set(cookieName, newUuid, {
        expires: sixMonthsFromNow,
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
      });
    }
  }

  return newUuid;
}