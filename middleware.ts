import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'

export async function middleware(request: NextRequest) {
  const authRes = await auth0.middleware(request)

  if (request.nextUrl.pathname.startsWith('/auth')) {
    return authRes
  }

  if (request.nextUrl.pathname === '/') {
    return authRes
  }

  const { origin } = new URL(request.url)
  const session = await auth0.getSession(request)

  if (!session) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  return authRes
}

export const config = {
  matcher: [
    '/api/wallet/:path*',
    '/api/wallets/:path*',
    '/api/balance/:path*',
    '/api/transactions/:path*',
    '/api/payments/:path*',
    '/api/binance/:path*',
    '/api/agent/:path*',
    '/dashboard/:path*',
  ],
}


