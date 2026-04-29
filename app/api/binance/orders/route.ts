import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { createBinanceClient } from '@/lib/blockchain/binance'
import { handleApiError, ValidationError } from '@/lib/errors'
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
      throw new Error('Binance not configured')
    }

    const url = new URL(request.url)
    const symbol = url.searchParams.get('symbol')
    const limit = parseInt(url.searchParams.get('limit') || '10', 10)

    if (!symbol) {
      throw new ValidationError('Symbol requerido')
    }

    const orders = await binance.getOrders(symbol, limit)
    return NextResponse.json({ orders })
  } catch (error) {
    const { statusCode, body } = handleApiError(error)
    return NextResponse.json(body, { status: statusCode })
  }
}

export const GET = rateLimiter(handler)
