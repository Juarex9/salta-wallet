"use client"

import { useState } from "react"
import { useUser } from "@auth0/nextjs-auth0/client"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2, Mail, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // Redirect if already logged in
  if (user) {
    router.push("/")
    return null
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Build Magic Link login URL
    window.location.href = `/auth/login?email=${encodeURIComponent(email)}`
  }

  const handleGoogleLogin = () => {
    window.location.href = "/auth/login?connection=google-oauth2"
  }

  const handleAppleLogin = () => {
    window.location.href = "/auth/login?connection=apple"
  }

  return (
    <main className="relative min-h-svh bg-background flex flex-col">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0 aura-glow opacity-70"
      />

      <div className="relative z-10 flex flex-1 flex-col justify-center px-6">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/30">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-sans text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your AI wallet
          </p>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-card/50 py-3 px-4 text-sm font-medium transition-colors hover:bg-card hover:border-primary/50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={handleAppleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-card/50 py-3 px-4 text-sm font-medium transition-colors hover:bg-card hover:border-primary/50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.23 0-1.38.65-2.13.45-3.08-.35C2.79 15.22 2.5 12.58 4.67 9.97c1.88-2.24 4.31-2.56 6.2-2.16 1.65.34 2.69.74 3.89 1.83.84-.89 1.7-1.7 2.96-1.68 1.51.03 2.55.75 3.23 1.6 1.13 1.41 1.05 2.85-.26 4.22-.86.9-2.02 1.5-2.27 2.2-.3.87.47 2.15 1.95 2.76.37.15.77.25 1.22.42.23.09.51.1.55.23-.1.13-1.02.87-1.58 1.21-1.03.62-2.16.61-3.23.34-.97-.25-1.86-.75-2.57-1.48.05.08.1.16.16.24z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Email Login - Magic Link */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Send Magic Link
                <Mail className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/auth/login?screen_hint=signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </main>
  )
}
