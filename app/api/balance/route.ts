import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { getWalletBalance } from '@/lib/blockchain'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's wallets from DB
    const wallets = await db.wallet.findMany({
      where: { userId: auth.userId },
    })

    // Fetch live balances for crypto wallets
    const cryptoWallets = wallets.filter(w => w.type === 'CRYPTO')
    const fiatWallets = wallets.filter(w => w.type === 'FIAT')

    // Get live balances from blockchain
    const cryptoBalances = await Promise.all(
      cryptoWallets.map(async w => {
        const live = await getWalletBalance(w.network!, w.address, w.currency)
        // Update balance in DB
        await db.wallet.update({
          where: { id: w.id },
          data: { balance: parseFloat(live.balance) },
        })
        return {
          ...w,
          balance: parseFloat(live.balance),
        }
      })
    )

    // Unified response
    const unifiedBalance = {
      total: {
        ars: 0,
        usd: 0,
      },
      fiat: fiatWallets.map(w => ({
        id: w.id,
        type: w.type,
        network: w.network,
        address: w.address,
        currency: w.currency,
        balance: w.balance,
      })),
      crypto: cryptoBalances.map(w => ({
        id: w.id,
        type: w.type,
        network: w.network,
        address: w.address,
        currency: w.currency,
        balance: w.balance,
      })),
    }

    // Calculate totals (simplified - no price feed yet)
    for (const w of fiatWallets) {
      if (w.currency === 'ARS') {
        unifiedBalance.total.ars += w.balance
      }
    }
    for (const w of cryptoBalances) {
      // TODO: multiply by price to get USD value
      unifiedBalance.total.usd += w.balance
    }

    return NextResponse.json(unifiedBalance)
  } catch (error) {
    console.error('Balance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}