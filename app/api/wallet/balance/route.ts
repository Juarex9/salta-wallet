import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEMO_USER_ID = 'demo-user'

export async function GET(request: NextRequest) {
  try {
    const wallets = await db.wallet.findMany({
      where: { userId: DEMO_USER_ID },
    })

    let totalBalance = 0
    for (const wallet of wallets) {
      if (wallet.type === 'FIAT') {
        totalBalance += wallet.balance
      } else {
        totalBalance += wallet.balance
      }
    }

    return NextResponse.json({
      totalBalance,
      currency: 'ARS',
      wallets,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Balance error:', error)
    return NextResponse.json(
      { error: 'Error al obtener balance' },
      { status: 500 }
    )
  }
}
