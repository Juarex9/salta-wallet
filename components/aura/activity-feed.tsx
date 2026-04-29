"use client"

import {
  Coffee,
  Repeat2,
  ShieldCheck,
  ArrowDownLeft,
  Zap,
  Sparkles,
  ArrowUpRight,
  Loader2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  description?: string
  createdAt: string
}

interface ActivityFeedProps {
  transactions?: Transaction[]
  loading?: boolean
}

// Map transaction to activity item
function txToActivity(tx: Transaction): Activity {
  const isIncoming = tx.amount > 0
  const isAgent = tx.method === "AGENT"
  
  return {
    icon: isIncoming ? ArrowDownLeft : ArrowUpRight,
    title: tx.description || "Transaction",
    meta: new Date(tx.createdAt).toLocaleString("es-AR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    amount: `${isIncoming ? "+" : "-"}${tx.currency} ${Math.abs(tx.amount).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
    amountClass: isIncoming ? "text-primary" : "text-foreground",
    rail: tx.method === "FIAT" ? "MP" : tx.method === "CRYPTO" ? "BNB" : "AGENT",
    agent: isAgent,
  }
}

// Fallback items when no transactions
const fallbackItems: Activity[] = [
  {
    icon: Coffee,
    title: "Café Martínez · Palermo",
    meta: "Today · 09:14",
    amount: "−$ 4.200,00",
    amountClass: "text-foreground",
    rail: "MP",
  },
  {
    icon: Repeat2,
    title: "Swap  BNB → USDT",
    meta: "Today · 08:02 · 0.42 BNB",
    amount: "+$ 318.204,10",
    amountClass: "text-primary",
    rail: "BNB",
    agent: true,
  },
  {
    icon: ShieldCheck,
    title: "Renewed Licencia Salta",
    meta: "Yesterday · gov credential",
    amount: "−$ 12.800,00",
    amountClass: "text-foreground",
    rail: "GOV",
    agent: true,
  },
  {
    icon: ArrowDownLeft,
    title: "Salary · Globant S.A.",
    meta: "Apr 22 · direct deposit",
    amount: "+$ 1.120.000,00",
    amountClass: "text-primary",
    rail: "MP",
  },
  {
    icon: Zap,
    title: "Gas · BSC network",
    meta: "Apr 22 · tx 0x91…4c",
    amount: "−$ 284,50",
    amountClass: "text-muted-foreground",
    rail: "BNB",
  },
]

type Activity = {
  icon: LucideIcon
  title: string
  meta: string
  amount: string
  amountClass: string
  rail: "MP" | "BNB" | "AGENT" | "GOV"
  agent?: boolean
}

const railBadge: Record<Activity["rail"], { label: string; className: string }> = {
  MP: { label: "MP", className: "bg-accent/15 text-accent" },
  BNB: { label: "BNB", className: "bg-primary/15 text-primary" },
  GOV: { label: "GOV", className: "bg-foreground/10 text-foreground" },
  AGENT: { label: "AI", className: "bg-primary/20 text-primary" },
}

export function ActivityFeed({ transactions, loading }: ActivityFeedProps) {
  const items = transactions && transactions.length > 0
    ? transactions.map(txToActivity)
    : fallbackItems

  return (
    <section aria-label="Activity">
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Activity</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · {transactions?.length || fallbackItems.length} items
          </span>
        </div>
        <button
          type="button"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </button>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border/70">
        {loading ? (
          <li className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </li>
        ) : (
          items.map((item, idx) => {
            const Icon = item.icon
            const badge = railBadge[item.rail]
            return (
              <li
                key={idx}
                className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-background/40"
              >
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
                  <Icon className="h-4 w-4 text-foreground" />
                  {item.agent && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
                      <Sparkles className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {item.meta}
                  </p>
                </div>

                <div className={`font-mono text-sm ${item.amountClass}`}>
                  {item.amount}
                </div>
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}