import { ArrowDownLeft, ArrowUpRight, QrCode, Repeat2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const actions: { label: string; Icon: LucideIcon }[] = [
  { label: "Send", Icon: ArrowUpRight },
  { label: "Receive", Icon: ArrowDownLeft },
  { label: "Swap", Icon: Repeat2 },
  { label: "Scan", Icon: QrCode },
]

export function QuickActions() {
  return (
    <nav aria-label="Quick actions" className="grid grid-cols-4 gap-2">
      {actions.map(({ label, Icon }) => (
        <button
          key={label}
          type="button"
          className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-card/80"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background ring-1 ring-border transition-colors group-hover:text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            {label}
          </span>
        </button>
      ))}
    </nav>
  )
}
