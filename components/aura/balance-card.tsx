import { ArrowUpRight, Eye, TrendingUp } from "lucide-react"

export function BalanceCard() {
  return (
    <section
      aria-label="Total balance"
      className="relative overflow-hidden rounded-[calc(var(--radius)+4px)] border border-border bg-card"
    >
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 aura-glow" />
      <div className="pointer-events-none absolute inset-0 aura-grid opacity-40" />

      <div className="relative p-5">
        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary/60" />
            unified balance
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <Eye className="h-3 w-3" />
            ARS
          </button>
        </div>

        {/* Amount */}
        <div className="mt-5 flex items-baseline gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">$</span>
          <h1 className="font-sans text-[44px] leading-none font-semibold tracking-tight">
            1.284.730
            <span className="text-muted-foreground">,</span>
            <span className="text-muted-foreground">58</span>
          </h1>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-primary">
            <TrendingUp className="h-3 w-3" />
            +2,14%
          </span>
          <span className="text-muted-foreground">24h · across 2 rails</span>
        </div>

        {/* Sub-balances */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <SubBalance
            label="Mercado Pago"
            code="MP · ARS"
            amount="847.320,14"
            accent="from-accent/80 to-accent/30"
            tag="fiat"
          />
          <SubBalance
            label="BNB Chain"
            code="BSC · USDT"
            amount="437.410,44"
            accent="from-primary/80 to-primary/30"
            tag="onchain"
          />
        </div>

        {/* Action strip */}
        <div className="mt-5 flex items-center justify-between rounded-xl border border-border/70 bg-background/40 px-3 py-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            ready to act
          </span>
          <span className="flex items-center gap-1 text-xs text-foreground">
            Agent suggestion
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </section>
  )
}

function SubBalance({
  label,
  code,
  amount,
  accent,
  tag,
}: {
  label: string
  code: string
  amount: string
  accent: string
  tag: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/70 bg-background/40 p-3 transition-colors hover:border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-6 w-6 rounded-full bg-gradient-to-br ${accent} ring-1 ring-border`}
            aria-hidden
          />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          {tag}
        </span>
      </div>
      <div className="mt-3 font-mono text-sm font-medium">
        <span className="text-muted-foreground">$</span>
        {amount}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {code}
      </div>
    </div>
  )
}
