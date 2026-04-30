"use client"

import { Bell } from "lucide-react"

export function StatusBar() {
  return (
    <header className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card">
          <div className="absolute inset-1 rounded-full bg-primary/15" />
          <div className="relative h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_2px] shadow-primary/70 animate-aura-pulse" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            aura · agent
          </span>
          <span className="text-sm font-medium">
            demo
            <span className="text-muted-foreground">.</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px] shadow-accent/60" />
          online
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <div
          aria-label="Profile"
          className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/70 to-accent/50 ring-1 ring-border"
        />
      </div>
    </header>
  )
}
