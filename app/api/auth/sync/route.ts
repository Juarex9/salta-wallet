import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@auth0/nextjs-auth0'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    // Find or create user in our DB
    let user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      // Create new user
      user = await db.user.create({
        data: {
          email: session.user.email,
          passwordHash: 'auth0-' + Math.random().toString(36), // Dummy password for Auth0 users
        },
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Auth0 sync error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}