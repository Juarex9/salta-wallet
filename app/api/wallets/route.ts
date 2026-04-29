import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wallets = await db.wallet.findMany({
      where: { userId: session.user.sub },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ wallets })
  } catch (error) {
    console.error('Wallets GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
        userId: session.user.sub,
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
        userId: session.user.sub,
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
