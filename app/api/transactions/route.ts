import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Autenticación requerida' },
        { status: 401 }
      )
    }

    const transactions = await db.transaction.findMany({
      where: { userId: session.user.sub },
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
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Autenticación requerida' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { fromWalletId, toWalletId, amount, currency, method, description } = body

    const transaction = await db.transaction.create({
      data: {
        userId: session.user.sub,
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
