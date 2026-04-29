// Sistema centralizado de logging y manejo de errores

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  level: LogLevel
  timestamp: string
  message: string
  context?: Record<string, unknown>
  error?: string
  stack?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
      error: error?.message,
      stack: error?.stack,
    }

    // Console output
    const logFn = this.getLogFunction(level)
    logFn(`[${entry.timestamp}] [${level}] ${message}`, context)

    // En producción, enviar a servicio de logging (ej: Sentry, LogRocket, etc.)
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      this.sendToMonitoring(entry)
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context)
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context, error)
  }

  private getLogFunction(level: LogLevel) {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug
      case LogLevel.INFO:
        return console.info
      case LogLevel.WARN:
        return console.warn
      case LogLevel.ERROR:
        return console.error
    }
  }

  private sendToMonitoring(entry: LogEntry) {
    // Implementar integración con servicio de monitoring
    // Ejemplo: Sentry, DataDog, etc.
    if (process.env.SENTRY_DSN) {
      // Integration with Sentry
      fetch(process.env.SENTRY_DSN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Silenciar errores de logging para no afectar la app
      })
    }
  }
}

export const logger = new Logger()

// Custom error classes
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, context)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Autenticación requerida', context?: Record<string, unknown>) {
    super(message, 401, context)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'No tienes permiso para acceder a este recurso', context?: Record<string, unknown>) {
    super(message, 403, context)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado', context?: Record<string, unknown>) {
    super(message, 404, context)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto de recurso', context?: Record<string, unknown>) {
    super(message, 409, context)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Demasiadas solicitudes', context?: Record<string, unknown>) {
    super(message, 429, context)
    this.name = 'RateLimitError'
  }
}

export class BlockchainError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 502, context)
    this.name = 'BlockchainError'
  }
}

// Función para manejar errores en rutas API
export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    logger.warn(error.message, error.context)
    return {
      statusCode: error.statusCode,
      body: {
        error: error.message,
        ...(error.context && { context: error.context }),
      },
    }
  }

  if (error instanceof Error) {
    logger.error('Error inesperado', error)
    return {
      statusCode: 500,
      body: {
        error: 'Error interno del servidor',
      },
    }
  }

  logger.error('Error desconocido', undefined, { error })
  return {
    statusCode: 500,
    body: {
      error: 'Error interno del servidor',
    },
  }
}
