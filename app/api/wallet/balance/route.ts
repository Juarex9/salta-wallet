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
    })

    // Calcular balance total (conversión simplificada)
    let totalBalance = 0
    for (const wallet of wallets) {
      if (wallet.type === 'FIAT') {
        totalBalance += wallet.balance
      } else {
        // Para crypto, asumir 1 USDT = 1 ARS (simplificado)
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
