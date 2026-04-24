import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const wallets = await db.wallet.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ wallets })
  } catch (error) {
    console.error('Wallets GET error:', error)
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
    const { type, network, address, currency } = body

    if (!type || !address) {
      return NextResponse.json(
        { error: 'Type and address are required' },
        { status: 400 }
      )
    }

    // Check if wallet already exists
    const existing = await db.wallet.findFirst({
      where: {
        userId: auth.userId,
        address: address.toLowerCase(),
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Wallet already exists' },
        { status: 409 }
      )
    }

    // Create wallet
    const wallet = await db.wallet.create({
      data: {
        userId: auth.userId,
        type: type.toUpperCase(),
        network: network?.toLowerCase() || null,
        address: address.toLowerCase(),
        currency: (currency || (type === 'FIAT' ? 'ARS' : 'ETH')).toUpperCase(),
      },
    })

    return NextResponse.json({ wallet })
  } catch (error) {
    console.error('Wallet POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}