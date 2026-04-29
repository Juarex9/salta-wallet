import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { createBinanceClient } from '@/lib/blockchain/binance'
import { handleApiError, BlockchainError } from '@/lib/errors'
import { createRateLimiter } from '@/lib/rate-limiter'

const rateLimiter = createRateLimiter({ maxRequests: 50 })

async function handler(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Autenticación requerida' },
        { status: 401 }
      )
    }

    const binance = createBinanceClient()
    if (!binance) {
      throw new BlockchainError('Binance no está configurado')
    }

    if (request.method === 'GET') {
      const balance = await binance.getBalance()
      return NextResponse.json({ balance })
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  } catch (error) {
    const { statusCode, body } = handleApiError(error)
    return NextResponse.json(body, { status: statusCode })
  }
}

export const GET = rateLimiter(handler)
