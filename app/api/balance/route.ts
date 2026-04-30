import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getWalletBalance } from '@/lib/blockchain'
import { getPrices } from '@/lib/blockchain/prices'

const DEMO_USER_ID = 'demo-user'

export async function GET(request: NextRequest) {
  try {
    const wallets = await db.wallet.findMany({
      where: { userId: DEMO_USER_ID },
    })

    const cryptoWallets = wallets.filter(w => w.type === 'CRYPTO')
    const fiatWallets = wallets.filter(w => w.type === 'FIAT')

    const currencies = [...new Set(cryptoWallets.map(w => w.currency))]
    const prices = await getPrices(currencies)

    const cryptoBalances = await Promise.all(
      cryptoWallets.map(async w => {
        const live = await getWalletBalance(w.network!, w.address, w.currency)
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

    const unifiedBalance = {
      total: { ars: 0, usd: 0 },
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

    for (const w of fiatWallets) {
      if (w.currency === 'ARS') unifiedBalance.total.ars += w.balance
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
