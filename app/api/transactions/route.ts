import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const transactions = await db.transaction.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Transactions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { fromWalletId, toWalletId, amount, currency, method, description } = body

    const transaction = await db.transaction.create({
      data: {
        userId: auth.userId,
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}