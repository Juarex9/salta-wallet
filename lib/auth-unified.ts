import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { AuthenticationError, logger } from './errors'

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

export interface AuthPayload {
  userId: string
  email: string
  provider: 'JWT' | 'AUTH0'
  iat: number
  exp: number
}

/**
 * Verificar JWT token
 */
export async function verifyJWT(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as AuthPayload
  } catch (error) {
    logger.debug('JWT verification failed', { error: String(error) })
    return null
  }
}

/**
 * Extraer token del header Authorization
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.slice(7) // Remove 'Bearer '
}

/**
 * Extraer usuario autenticado del request
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthPayload | null> {
  const token = extractToken(request)

  if (!token) {
    return null
  }

  const payload = await verifyJWT(token)

  if (!payload) {
    return null
  }

  return payload
}

/**
 * Middleware para proteger rutas
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const user = await getAuthenticatedUser(request)

      if (!user) {
        throw new AuthenticationError('Token no válido o expirado')
      }

      return handler(request, user)
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        )
      }

      logger.error('Auth middleware error', error instanceof Error ? error : undefined)
      return NextResponse.json(
        { error: 'Error de autenticación' },
        { status: 401 }
      )
    }
  }
}

/**
 * Middleware para validar tokens Auth0 (futura integración)
 */
export async function verifyAuth0Token(token: string): Promise<AuthPayload | null> {
  // Esta función se implementará cuando se configure Auth0 completamente
  // Por ahora, retorna null para fallback a JWT
  try {
    // Validar contra Auth0 provider
    // const decoded = await jwtVerify(token, getAuth0PublicKey());
    // return decoded.payload as AuthPayload;
    return null
  } catch (error) {
    logger.debug('Auth0 verification failed', { error: String(error) })
    return null
  }
}

/**
 * Validar usuario con fallback entre proveedores
 */
export async function validateUser(request: NextRequest): Promise<AuthPayload | null> {
  const user = await getAuthenticatedUser(request)

  if (user) {
    return user
  }

  // Fallback a Auth0 si JWT falla
  const token = extractToken(request)
  if (token) {
    const auth0User = await verifyAuth0Token(token)
    if (auth0User) {
      return auth0User
    }
  }

  return null
}
