import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { db } from '@/lib/db'
import { getWalletBalance } from '@/lib/blockchain'
import { getPrices } from '@/lib/blockchain/prices'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's wallets from DB
    const wallets = await db.wallet.findMany({
      where: { userId: session.user.sub },
    })

    // Fetch live balances for crypto wallets
    const cryptoWallets = wallets.filter(w => w.type === 'CRYPTO')
    const fiatWallets = wallets.filter(w => w.type === 'FIAT')

    // Get unique currencies for price fetch
    const currencies = [...new Set(cryptoWallets.map(w => w.currency))]
    const prices = await getPrices(currencies)

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
          priceArs: prices[w.currency]?.ars || 0,
          priceUsd: prices[w.currency]?.usd || 0,
        }
      })
    )

    // Unified response
    const unifiedBalance = {
      total: {
        ars: 0,
        usd: 0,
      },
      prices,
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
        balanceArs: w.balance * w.priceArs,
        balanceUsd: w.balance * w.priceUsd,
      })),
    }

    // Calculate totals
    for (const w of fiatWallets) {
      if (w.currency === 'ARS') {
        unifiedBalance.total.ars += w.balance
      }
    }
    for (const w of cryptoBalances) {
      unifiedBalance.total.ars += w.balance * w.priceArs
      unifiedBalance.total.usd += w.balance * w.priceUsd
    }

    return NextResponse.json(unifiedBalance)
  } catch (error) {
    console.error('Balance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
