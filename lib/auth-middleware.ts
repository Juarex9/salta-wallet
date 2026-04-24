import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export interface AuthUser {
  userId: string
  email: string
}

// Extract and verify token from Authorization header
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7) // Remove 'Bearer '
  const payload = await verifyToken(token)
  
  if (!payload) {
    return null
  }

  return {
    userId: payload.userId,
    email: payload.email,
  }
}

// Higher-order function to protect routes
export function withAuth(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return handler(request, user)
  }
}