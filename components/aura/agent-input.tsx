"use client"

import { ArrowUp, Mic, Sparkles, Loader2 } from "lucide-react"
import { useState } from "react"
import { agentApi } from "@/lib/auth/api-client"

interface Wallet {
  id: string
  type: string
  network?: string
  address: string
  balance: number
  currency: string
}

interface AgentInputProps {
  wallets?: Wallet[]
}

const suggestions = [
  "Pay 50000 ARS rent",
  "Send 100 USDT to friend",
  "Check my balance",
  "What's the best way to pay?",
]

interface Recommendation {
  method: "FIAT" | "CRYPTO"
  wallet: {
    id: string
    currency: string
    balance: number
  }
  reasoning: string
  estimatedFee: string
  estimatedTime: string
}

export function AgentInput({ wallets }: AgentInputProps) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      // Parse the input to get amount and currency
      const parsed = parseAgentInput(value)
      
      if (parsed) {
        const result = await agentApi.recommend({
          amount: parsed.amount,
          currency: parsed.currency,
          category: parsed.category,
          urgency: parsed.urgency,
        })
        
        if (result.recommended) {
          setRecommendation(result.recommended)
        }
        
        setValue("")
      } else {
        setError("Could not understand. Try: Pay 50000 ARS or Send 100 USDT")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center">
      {/* Mask so content fades under the bar */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/90 to-transparent" />

      <div className="pointer-events-auto w-full max-w-md px-4 pb-4">
        {/* Recommendation result */}
        {recommendation && (
          <div className="mb-3 rounded-xl border border-primary/30 bg-primary/10 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">
                Recommended: {recommendation.method}
              </span>
              <button
                onClick={() => setRecommendation(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-sm text-foreground">
              {recommendation.reasoning}
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span>Fee: {recommendation.estimatedFee}</span>
              <span>Time: {recommendation.estimatedTime}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Suggestion chips */}
        <div className="scroll-hide mb-3 flex gap-2 overflow-x-auto">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue(s)}
              className="shrink-0 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input shell */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2 rounded-full border border-border bg-card/85 p-1.5 pl-3 shadow-[0_12px_40px_-16px] shadow-primary/30 backdrop-blur-xl"
        >
          {/* Agent pulse */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span
              aria-hidden
              className="font-mono text-sm text-primary select-none"
            >
              ›
            </span>
            <label htmlFor="agent-input" className="sr-only">
              Ask your agent
            </label>
            <input
              id="agent-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask your agent..."
              className="w-full bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoComplete="off"
              disabled={loading}
            />
            {value.length === 0 && !loading && (
              <span
                aria-hidden
                className="ml-[-8px] inline-block h-4 w-[2px] translate-y-[1px] bg-primary/80 animate-caret"
              />
            )}
          </div>

          <button
            type="button"
            aria-label="Voice input"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="submit"
            aria-label="Send to agent"
            disabled={loading || !value.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-50"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>

        {/* Terminal footer */}
        <div className="mt-2 flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-accent shadow-[0_0_6px] shadow-accent/60" />
            agent · {loading ? "thinking" : "idle"} · {wallets?.length || 0} wallets
          </span>
          <span>v0.5.0</span>
        </div>
      </div>
    </div>
  )
}

/* -------------------- Parse agent input -------------------- */
interface ParsedInput {
  amount: number
  currency: string
  category?: string
  urgency?: string
}

function parseAgentInput(input: string): ParsedInput | null {
  const lower = input.toLowerCase()
  
  // Match patterns like "Pay 50000 ARS", "Send 100 USDT", "50000 ars"
  const amountMatch = lower.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/)
  const currencyMatch = lower.match(/(ars|usdt|usdc|eth|btc|bnb|usd)/i)
  
  if (!amountMatch || !currencyMatch) return null
  
  const amount = parseFloat(amountMatch[1].replace(/,/g, ""))
  const currency = currencyMatch[1].toUpperCase()
  
  // Detect category
  let category: string | undefined
  if (lower.includes("rent")) category = "rent"
  else if (lower.includes("food")) category = "food"
  else if (lower.includes("utilit")) category = "utilities"
  else if (lower.includes("transfer") || lower.includes("send")) category = "transfer"
  
  // Detect urgency
  let urgency: string | undefined
  if (lower.includes("urgent") || lower.includes("now")) urgency = "urgent"
  
  return { amount, currency, category, urgency }
}