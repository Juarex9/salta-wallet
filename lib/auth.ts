import { getSession } from '@auth0/nextjs-auth0'

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  return {
    id: session.user.sub,
    email: session.user.email,
    name: session.user.name,
  }
}

export async function verifyAuth() {
  const session = await getSession()
  return session?.user || null
}

