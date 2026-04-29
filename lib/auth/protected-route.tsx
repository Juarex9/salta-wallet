"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@auth0/nextjs-auth0/client"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return <>{children}</>
}