import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (en producción usar Redis)
interface RateLimitConfig {
  windowMs: number // ventana de tiempo en ms
  maxRequests: number // máximo de solicitudes por ventana
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100,
}

function getClientId(request: NextRequest): string {
  // Prioridad: X-Forwarded-For > CF-Connecting-IP > IP del socket
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return 'unknown'
}

export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  return function rateLimiterMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const clientId = getClientId(request)
      const now = Date.now()

      // Limpiar registros antiguos
      if (store[clientId] && store[clientId].resetTime < now) {
        delete store[clientId]
      }

      // Inicializar o actualizar contador
      if (!store[clientId]) {
        store[clientId] = {
          count: 0,
          resetTime: now + finalConfig.windowMs,
        }
      }

      store[clientId].count++

      // Verificar límite
      if (store[clientId].count > finalConfig.maxRequests) {
        return NextResponse.json(
          {
            error: 'Demasiadas solicitudes. Por favor intenta más tarde.',
            retryAfter: Math.ceil(
              (store[clientId].resetTime - now) / 1000
            ),
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(
                Math.ceil((store[clientId].resetTime - now) / 1000)
              ),
            },
          }
        )
      }

      // Agregar headers de rate limit
      const response = await handler(request)
      response.headers.set('X-RateLimit-Limit', String(finalConfig.maxRequests))
      response.headers.set('X-RateLimit-Remaining', String(finalConfig.maxRequests - store[clientId].count))
      response.headers.set('X-RateLimit-Reset', String(store[clientId].resetTime))

      return response
    }
  }
}

// Limpiar store cada 30 minutos
if (typeof global !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    }
  }, 30 * 60 * 1000)
}
