"use client"

import { ArrowUp, Mic, Sparkles } from "lucide-react"
import { useState } from "react"

const suggestions = [
  "Pay my rent with MP",
  "Swap 0.5 BNB to ARS",
  "Send 50 USDT to Lucas",
  "Show me last week's spend",
]

export function AgentInput() {
  const [value, setValue] = useState("")

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center">
      {/* Mask so content fades under the bar */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/90 to-transparent" />

      <div className="pointer-events-auto w-full max-w-md px-4 pb-4">
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
          onSubmit={(e) => e.preventDefault()}
          className="relative flex items-center gap-2 rounded-full border border-border bg-card/85 p-1.5 pl-3 shadow-[0_12px_40px_-16px] shadow-primary/30 backdrop-blur-xl"
        >
          {/* Agent pulse */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
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
            />
            {value.length === 0 && (
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>

        {/* Terminal footer */}
        <div className="mt-2 flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-accent shadow-[0_0_6px] shadow-accent/60" />
            agent · idle · 2 tools armed
          </span>
          <span>v0.4.1</span>
        </div>
      </div>
    </div>
  )
}
