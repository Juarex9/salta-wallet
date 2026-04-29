import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createToken, verifyPassword } from '@/lib/auth'
import { loginSchema } from '@/lib/schemas'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar con Zod
    const validatedData = loginSchema.parse(body)
    const { email, password } = validatedData

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validación fallida', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
