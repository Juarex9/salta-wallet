import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'

export default withMiddlewareAuthRequired()

export const config = {
  matcher: [
    '/api/wallet/:path*',
    '/api/wallets/:path*',
    '/api/balance/:path*',
    '/api/transactions/:path*',
    '/api/payments/:path*',
    '/api/binance/:path*',
    '/api/agent/:path*',
  ],
}

