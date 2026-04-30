import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createPaymentLink } from '@/lib/mercadopago'

const DEMO_USER_ID = 'demo-user'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, description } = body

    if (!amount || !description) {
      return NextResponse.json(
        { error: 'Amount and description required' },
        { status: 400 }
      )
    }

    const payment = await createPaymentLink(
      amount,
      description,
      `wallet-${DEMO_USER_ID}`
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
