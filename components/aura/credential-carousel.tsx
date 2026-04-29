"use client"

import { useState } from "react"
import { Plus, Wallet, Loader2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { walletsApi } from "@/lib/auth/api-client"

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

const NETWORKS = [
  { value: "ethereum", label: "Ethereum", color: "#627eea" },
  { value: "bsc", label: "BNB Chain", color: "#f3ba2f" },
  { value: "polygon", label: "Polygon", color: "#8247e5" },
  { value: "arbitrum", label: "Arbitrum", color: "#28a0f0" },
  { value: "optimism", label: "Optimism", color: "#ff0420" },
  { value: "avalanche", label: "Avalanche", color: "#e84142" },
]

const TOKENS = [
  { value: "ETH", label: "ETH" },
  { value: "USDT", label: "USDT" },
  { value: "USDC", label: "USDC" },
  { value: "BNB", label: "BNB" },
  { value: "MATIC", label: "MATIC" },
  { value: "WETH", label: "WETH" },
  { value: "WBTC", label: "WBTC" },
]

export function CredentialCarousel({ wallets, loading, onRefresh }: CredentialCarouselProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")
  
  const [network, setNetwork] = useState("bsc")
  const [currency, setCurrency] = useState("USDT")
  const [address, setAddress] = useState("")

  const fiatWallets = wallets.filter((w) => w.type === "FIAT")
  const cryptoWallets = wallets.filter((w) => w.type === "CRYPTO")

  const handleAddWallet = async () => {
    if (!address.trim()) {
      setError("Wallet address is required")
      return
    }
    
    setError("")
    setAdding(true)
    
    try {
      await walletsApi.add({
        type: "CRYPTO",
        network,
        address: address.trim(),
        currency,
      })
      setIsOpen(false)
      setAddress("")
      onRefresh?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
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
              {fiatWallets.map((w) => (
                <FiatCard key={w.id} wallet={w} />
              ))}
              {cryptoWallets.map((w) => (
                <CryptoCard key={w.id} wallet={w} />
              ))}
              
              {/* Add wallet card */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex h-[196px] w-[200px] shrink-0 snap-center flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
                  <Plus className="h-4 w-4" />
                </span>
                <span className="text-xs font-medium">Add wallet</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                  BSC · ETH · MATIC
                </span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* Add Wallet Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Crypto Wallet</DialogTitle>
            <DialogDescription>
              Connect a blockchain wallet to track your crypto balance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Network */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Network</label>
              <div className="grid grid-cols-3 gap-2">
                {NETWORKS.map((net) => (
                  <button
                    key={net.value}
                    type="button"
                    onClick={() => setNetwork(net.value)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      network === net.value
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {net.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                {TOKENS.map((tok) => (
                  <option key={tok.value} value={tok.value}>
                    {tok.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Wallet Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-mono"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddWallet}
              disabled={adding || !address.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add Wallet"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(0,158,227,0.2),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.07)_50%,transparent_60%)]" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#009ee3]/35 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />

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

      <div className="relative mt-5">
        <div className="truncate text-[24px] font-semibold text-[#e4ddd3]">
          ${wallet.balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e4ddd3]/55">
          {wallet.currency} · available
        </div>
      </div>

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(228,221,211,0.22),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full blur-3xl" style={{ backgroundColor: `${color}30` }} />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />

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
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
        </div>
      </div>

      <div className="relative mt-5">
        <div className="truncate text-[24px] font-semibold text-[#e4ddd3]">
          {wallet.balance.toFixed(wallet.currency === "USDT" || wallet.currency === "USDC" ? 2 : 6)}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e4ddd3]/55">
          {wallet.currency} · available
        </div>
      </div>

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