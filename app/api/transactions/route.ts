import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'demo-user'

export async function GET(request: NextRequest) {
  try {
    const transactions = await db.transaction.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Transactions error:', error)
    return NextResponse.json({ error: 'Error al obtener transacciones' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromWalletId, toWalletId, amount, currency, method, description } = body

    const transaction = await db.transaction.create({
      data: {
        userId: DEMO_USER_ID,
        fromWalletId,
        toWalletId,
        amount,
        currency,
        method,
        description,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Transaction create error:', error)
    return NextResponse.json({ error: 'Error al crear transacción' }, { status: 500 })
  }
}
