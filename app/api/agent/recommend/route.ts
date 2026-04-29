import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { getPaymentRecommendation } from '@/lib/ai/payment-agent'
import { handleApiError, ValidationError } from '@/lib/errors'
import { paymentRecommendationSchema } from '@/lib/schemas'
import { createRateLimiter } from '@/lib/rate-limiter'

const rateLimiter = createRateLimiter({ maxRequests: 30 })

async function handler(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Autenticación requerida' },
        { status: 401 }
      )
    }

    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Método no permitido' },
        { status: 405 }
      )
    }

    const body = await request.json()

    // Validar datos de entrada
    const validatedInput = paymentRecommendationSchema.parse({
      amount: body.amount,
      currency: body.currency,
      country: body.country,
      paymentFrequency: body.paymentFrequency,
      userPreferences: body.userPreferences,
    })

    // Obtener recomendación del agente IA
    const recommendation = await getPaymentRecommendation(
      validatedInput.amount,
      validatedInput.currency,
      validatedInput.country,
      validatedInput.userPreferences
    )

    return NextResponse.json({
      success: true,
      recommendation,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const { statusCode, body } = handleApiError(error)
    return NextResponse.json(body, { status: statusCode })
  }
}

export const POST = rateLimiter(handler)
