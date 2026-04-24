import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createToken, hashPassword, verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Create user
    const passwordHash = await hashPassword(password)
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
      },
    })

    // Generate token
    const token = await createToken(user.id, user.email)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}