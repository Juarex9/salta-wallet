import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'

export interface RecommendationRequest {
  amount: number
  currency: string // e.g., "ARS", "USDT", "USD"
  recipient?: string
  category?: string // "rent", "food", "services", "utilities", "transfer"
  urgency?: "normal" | "urgent"
}

export interface Recommendation {
  method: "FIAT" | "CRYPTO"
  wallet: {
    id: string
    network?: string
    currency: string
    balance: number
  }
  reasoning: string
  savings?: number // crypto savings compared to fiat
  estimatedFee: string
  estimatedTime: string
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: RecommendationRequest = await request.json()
    const { amount, currency, category, urgency } = body

    if (!amount || !currency) {
      return NextResponse.json(
        { error: 'Amount and currency are required' },
        { status: 400 }
      )
    }

    // Get user's wallets
    const wallets = await db.wallet.findMany({
      where: { userId: auth.userId },
    })

    const fiatWallets = wallets.filter(w => w.type === 'FIAT')
    const cryptoWallets = wallets.filter(w => w.type === 'CRYPTO')

    // Simple rule-based recommendation
    const recommendations: Recommendation[] = []

    // FIAT option
    const fiatWallet = fiatWallets.find(w => w.currency === currency || w.currency === 'ARS')
    if (fiatWallet && fiatWallet.balance >= amount) {
      recommendations.push({
        method: "FIAT",
        wallet: {
          id: fiatWallet.id,
          currency: fiatWallet.currency,
          balance: fiatWallet.balance,
        },
        reasoning: getFiatReasoning(category, urgency),
        estimatedFee: "0-1%",
        estimatedTime: "instant",
      })
    }

    // CRYPTO options
    for (const crypto of cryptoWallets) {
      if (crypto.balance >= amount) {
        recommendations.push({
          method: "CRYPTO",
          wallet: {
            id: crypto.id,
            network: crypto.network || undefined,
            currency: crypto.currency,
            balance: crypto.balance,
          },
          reasoning: getCryptoReasoning(crypto.network, crypto.currency, category),
          estimatedFee: getCryptoFee(crypto.network),
          estimatedTime: "1-10 min",
        })
      }
    }

    // Sort by "best" (simple heuristic: fiat first unless big amount)
    const sorted = sortRecommendations(recommendations, amount)

    // Main recommendation
    const best = sorted[0] || null

    return NextResponse.json({
      amount,
      currency,
      recommendations: sorted,
      recommended: best,
    })
  } catch (error) {
    console.error('Agent recommend error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getFiatReasoning(category?: string, urgency?: string): string {
  if (urgency === 'urgent') {
    return "Pago instantáneo sin necesidad de confirmación blockchain"
  }
  switch (category) {
    case 'rent':
      return " традиционный pago de alquiler, sin fees de red"
    case 'food':
      return "Pago inmediato en locales físicos"
    case 'utilities':
      return "Pago de servicios con ticket física"
    default:
      return "Pago tradicional sin complejidad crypto"
  }
}

function getCryptoReasoning(network?: string, currency?: string, category?: string): string {
  const net = network || 'unknown'
  const curr = currency || 'unknown'

  if (curr === 'USDT' || curr === 'USDC') {
    return `Stablecoin ${curr} - sin volatilidad, fees bajos (~$1), ideal para transfers`
  }
  if (net === 'bsc') {
    return "BNB Chain - fees muy bajos (<$1), rápido"
  }
  if (net === 'polygon') {
    return "Polygon - fees mínimos, green network"
  }
  return `Crypto ${curr} en ${net} - network con fees moderados`
}

function getCryptoFee(network?: string): string {
  switch (network) {
    case 'bsc': return "<$1"
    case 'polygon': return "<$0.01"
    case 'ethereum': return "$2-10"
    case 'arbitrum': return "<$0.5"
    case 'optimism': return "<$0.5"
    default: return "~$1"
  }
}

function sortRecommendations(
  recommendations: Recommendation[],
  amount: number
): Recommendation[] {
  // For small amounts (< 500 USD): fiat preferred
  // For medium amounts (500-5000): crypto if stablecoin
  // For large amounts (> 5000): crypto with lowest fee
  if (amount < 500) {
    return recommendations.sort((a, b) => {
      if (a.method === 'FIAT' && b.method !== 'FIAT') return -1
      if (a.method !== 'FIAT' && b.method === 'FIAT') return 1
      return 0
    })
  }

  if (amount > 5000) {
    // Sort by fee for large amounts
    return recommendations.sort((a, b) => {
      const feeA = parseFloat(a.estimatedFee.replace('<', '').replace('$', ''))
      const feeB = parseFloat(b.estimatedFee.replace('<', '').replace('$', ''))
      return feeA - feeB
    })
  }

  // Medium: prefer USDT/USDC
  return recommendations.sort((a, b) => {
    const aStable = a.wallet.currency === 'USDT' || a.wallet.currency === 'USDC' ? 0 : 1
    const bStable = b.wallet.currency === 'USDT' || b.wallet.currency === 'USDC' ? 0 : 1
    return aStable - bStable
  })
}