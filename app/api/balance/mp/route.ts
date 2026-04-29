import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getMPSBalance } from '@/lib/mercadopago'

const DEMO_USER_ID = 'demo-user'

export async function GET(request: NextRequest) {
  try {
    const mpBalance = await getMPSBalance()

    let mpWallet = await db.wallet.findFirst({
      where: {
        userId: DEMO_USER_ID,
        type: 'FIAT',
        currency: 'ARS',
      },
    })

    if (!mpWallet) {
      mpWallet = await db.wallet.create({
        data: {
          userId: DEMO_USER_ID,
          type: 'FIAT',
          network: null,
          address: 'mercadopago',
          balance: mpBalance?.available?.[0]?.amount || 0,
          currency: 'ARS',
        },
      })
    } else {
      mpWallet = await db.wallet.update({
        where: { id: mpWallet.id },
        data: {
          balance: mpBalance?.available?.[0]?.amount || 0,
        },
      })
    }

    return NextResponse.json({
      wallet: {
        id: mpWallet.id,
        type: mpWallet.type,
        network: mpWallet.network,
        address: mpWallet.address,
        currency: mpWallet.currency,
        balance: mpWallet.balance,
      },
      mpBalance,
    })
  } catch (error) {
    console.error('MP balance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
