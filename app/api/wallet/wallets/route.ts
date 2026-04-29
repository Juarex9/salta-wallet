import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Autenticación requerida' },
        { status: 401 }
      )
    }

    // Obtener todos los wallets del usuario
    const wallets = await db.wallet.findMany({
      where: { userId: session.user.sub },
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
