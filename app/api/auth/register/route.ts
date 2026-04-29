import { handleLogin } from '@auth0/nextjs-auth0'

export async function GET(request: Request) {
  return handleLogin(request, {
    authorizationParams: {
      screen_hint: 'signup',
    },
  })
}

