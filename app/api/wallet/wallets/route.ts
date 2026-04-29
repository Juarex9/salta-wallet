import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'demo-user'

export async function GET(request: NextRequest) {
  try {
    const wallets = await db.wallet.findMany({
      where: { userId: DEMO_USER_ID },
      select: {
        id: true,
        address: true,
        type: true,
        currency: true,
        balance: true,
        network: true,
      },
    })

    return NextResponse.json({
      wallets,
      count: wallets.length,
    })
  } catch (error) {
    console.error('Wallets error:', error)
    return NextResponse.json(
      { error: 'Error al obtener wallets' },
      { status: 500 }
    )
  }
}
