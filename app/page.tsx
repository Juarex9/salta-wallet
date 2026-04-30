"use client"

import { StatusBar } from "@/components/aura/status-bar"
import { BalanceCard } from "@/components/aura/balance-card"
import { QuickActions } from "@/components/aura/quick-actions"
import { CredentialCarousel } from "@/components/aura/credential-carousel"
import { ActivityFeed } from "@/components/aura/activity-feed"
import { AgentInput } from "@/components/aura/agent-input"
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
    <main className="relative min-h-svh bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0 aura-glow opacity-70"
      />

      <div className="relative mx-auto w-full max-w-md">
        <div className="sticky top-0 z-20 bg-background/70 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl">
          <StatusBar />
        </div>

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

      <div className="mx-auto w-full max-w-md">
        <AgentInput wallets={wallets} />
      </div>
    </main>
  )
}
