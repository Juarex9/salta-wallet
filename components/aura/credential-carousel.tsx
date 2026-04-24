"use client"

import { Plus, Wallet, Loader2 } from "lucide-react"

interface Wallet {
  id: string
  type: string
  network?: string
  address: string
  balance: number
  currency: string
}

interface CredentialCarouselProps {
  wallets: Wallet[]
  loading?: boolean
  onRefresh?: () => void
}

export function CredentialCarousel({ wallets, loading }: CredentialCarouselProps) {
  // Separate fiat and crypto
  const fiatWallets = wallets.filter((w) => w.type === "FIAT")
  const cryptoWallets = wallets.filter((w) => w.type === "CRYPTO")

  return (
    <section aria-label="Credentials" className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Credentials</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · {wallets.length} connected
          </span>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Manage
        </button>
      </div>

      <div className="scroll-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {loading ? (
          <div className="flex h-[196px] w-[300px] shrink-0 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Show connected wallets */}
            {fiatWallets.map((w) => (
              <FiatCard key={w.id} wallet={w} />
            ))}
            {cryptoWallets.map((w) => (
              <CryptoCard key={w.id} wallet={w} />
            ))}
            
            {/* Add wallet card */}
            <AddWalletCard />
          </>
        )}
      </div>
    </section>
  )
}

function getNetworkColor(network?: string): string {
  switch (network?.toLowerCase()) {
    case "eth":
    case "ethereum":
      return "#627eea"
    case "bsc":
      return "#f3ba2f"
    case "polygon":
      return "#8247e5"
    case "arbitrum":
      return "#28a0f0"
    case "optimism":
      return "#ff0420"
    case "avalanche":
      return "#e84142"
    default:
      return "#6ad3cd"
  }
}

/* -------------------- Fiat Wallet Card -------------------- */
function FiatCard({ wallet }: { wallet: Wallet }) {
  return (
    <article
      className="relative h-[196px] w-[300px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#009ee3]/35 via-[#00a19b]/12 to-[#0a1a1a]/70 p-4 backdrop-blur-xl"
      aria-label={wallet.currency}
    >
      {/* Glass layers */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(0,158,227,0.2),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.07)_50%,transparent_60%)]" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#009ee3]/35 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#e4ddd3]/75">
            <span className="h-1 w-1 rounded-full bg-[#6ad3cd]" />
            Fiat
          </div>
          <div className="mt-1 text-sm font-semibold text-[#e4ddd3]">
            {wallet.currency}
          </div>
          <div className="text-[11px] text-[#e4ddd3]/60">
            {wallet.currency === "ARS" ? "Peso Argentino" : wallet.currency}
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10 backdrop-blur-md">
          <Wallet className="h-4 w-4 text-[#e4ddd3]" />
        </div>
      </div>

      {/* Balance */}
      <div className="relative mt-5">
        <div className="truncate text-[24px] font-semibold text-[#e4ddd3]">
          ${wallet.balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e4ddd3]/55">
          {wallet.currency} · available
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#e4ddd3]/55">
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-[#6ad3cd]" />
          connected
        </span>
        <span className="truncate max-w-[100px]">****{wallet.address.slice(-4)}</span>
      </div>
    </article>
  )
}

/* -------------------- Crypto Wallet Card -------------------- */
function CryptoCard({ wallet }: { wallet: Wallet }) {
  const color = getNetworkColor(wallet.network)

  return (
    <article
      className="relative h-[196px] w-[300px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#e4ddd3]/30 via-[#c9bfad]/15 to-[#1a1612]/80 p-4 backdrop-blur-xl"
      aria-label={wallet.currency}
    >
      {/* Glass + flare */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(228,221,211,0.22),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full blur-3xl" style={{ backgroundColor: `${color}30` }} />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#e4ddd3]/80">
            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color }} />
            {wallet.network?.toUpperCase() || "unknown"}
          </div>
          <div className="mt-1 text-sm font-semibold text-[#e4ddd3]">
            {wallet.currency}
          </div>
          <div className="text-[11px] text-[#e4ddd3]/60">
            {getNetworkLabel(wallet.network)}
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-white/10 backdrop-blur-md">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      {/* Balance */}
      <div className="relative mt-5">
        <div className="truncate text-[24px] font-semibold text-[#e4ddd3]">
          {wallet.balance.toFixed(wallet.currency === "USDT" || wallet.currency === "USDC" ? 2 : 6)}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e4ddd3]/55">
          {wallet.currency} · available
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#e4ddd3]/55">
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color }} />
          on-chain
        </span>
        <span className="truncate max-w-[100px]">
          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
        </span>
      </div>
    </article>
  )
}

function getNetworkLabel(network?: string): string {
  switch (network?.toLowerCase()) {
    case "eth":
    case "ethereum":
      return "Ethereum"
    case "bsc":
      return "BNB Chain"
    case "polygon":
      return "Polygon"
    case "arbitrum":
      return "Arbitrum"
    case "optimism":
      return "Optimism"
    case "avalanche":
      return "Avalanche"
    default:
      return "Blockchain"
  }
}

/* -------------------- Add wallet card -------------------- */
function AddWalletCard() {
  return (
    <button
      type="button"
      className="flex h-[196px] w-[200px] shrink-0 snap-center flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      onClick={() => {
        // TODO: Open modal to add wallet
        const address = prompt("Enter wallet address:")
        const network = prompt("Enter network (bsc, ethereum, polygon)?")
        const currency = prompt("Enter currency (USDT, ETH, BNB)?")
        if (address && network && currency) {
          // Call API
          console.log("Add wallet:", { address, network, currency })
        }
      }}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
        <Plus className="h-4 w-4" />
      </span>
      <span className="text-xs font-medium">Add wallet</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
        BSC · ETH · MATIC
      </span>
    </button>
  )
}