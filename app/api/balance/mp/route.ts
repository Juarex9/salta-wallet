import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { db } from '@/lib/db'
import { getMPSBalance } from '@/lib/mercadopago'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get MPC balance
    const mpBalance = await getMPSBalance()

    // Get or create MP wallet in DB
    let mpWallet = await db.wallet.findFirst({
      where: {
        userId: session.user.sub,
        type: 'FIAT',
        currency: 'ARS',
      },
    })

    // If no MP wallet, create one
    if (!mpWallet) {
      mpWallet = await db.wallet.create({
        data: {
          userId: session.user.sub,
          type: 'FIAT',
          network: null,
          address: 'mercadopago',
          balance: mpBalance?.available?.[0]?.amount || 0,
          currency: 'ARS',
        },
      })
    } else {
      // Update balance
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
