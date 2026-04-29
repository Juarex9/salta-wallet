import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { db } from '@/lib/db'
import { createPaymentLink } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      `wallet-${session.user.sub}`
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
