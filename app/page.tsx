"use client"

import { StatusBar } from "@/components/aura/status-bar"
import { BalanceCard } from "@/components/aura/balance-card"
import { QuickActions } from "@/components/aura/quick-actions"
import { CredentialCarousel } from "@/components/aura/credential-carousel"
import { ActivityFeed } from "@/components/aura/activity-feed"
import { AgentInput } from "@/components/aura/agent-input"
import { ProtectedRoute } from "@/lib/auth/protected-route"
import { useBalance, useWallets, useTransactions } from "@/hooks/use-wallet"

export default function AuraPage() {
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useBalance()
  const { wallets, refetch: refetchWallets } = useWallets()
  const { transactions, loading: txLoading } = useTransactions()

  const handleRefresh = () => {
    refetchBalance()
    refetchWallets()
  }

  return (
    <ProtectedRoute>
      <main className="relative min-h-svh bg-background">
        {/* Ambient glow behind the whole app */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-0 aura-glow opacity-70"
        />

        {/* Mobile-first container — behaves like a device frame on md+ */}
        <div className="relative mx-auto w-full max-w-md">
          {/* Top sticky rail */}
          <div className="sticky top-0 z-20 bg-background/70 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl">
            <StatusBar />
          </div>

          {/* Content — leaves space for the fixed agent bar */}
          <div className="flex flex-col gap-5 px-4 pb-48">
            <BalanceCard 
              balance={balance} 
              loading={balanceLoading} 
              onRefresh={handleRefresh}
            />
            <QuickActions />
            <CredentialCarousel 
              wallets={wallets}
              loading={balanceLoading}
              onRefresh={handleRefresh}
            />
            <ActivityFeed 
              transactions={transactions}
              loading={txLoading}
            />
          </div>
        </div>

        {/* Persistent AI agent input */}
        <div className="mx-auto w-full max-w-md">
          <AgentInput wallets={wallets} />
        </div>
      </main>
    </ProtectedRoute>
  )
}