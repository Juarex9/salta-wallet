import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { createPaymentLink } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { amount, description } = body

    if (!amount || !description) {
      return NextResponse.json(
        { error: 'Amount and description required' },
        { status: 400 }
      )
    }

    // Create payment link
    const payment = await createPaymentLink(
      amount,
      description,
      `wallet-${auth.userId}`
    )

    if (!payment) {
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: payment.id,
      initPoint: payment.init_point,
      externalReference: payment.external_reference,
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}