import { BadgeCheck, IdCard, ShieldCheck, CarFront, Plus } from "lucide-react"

export function CredentialCarousel() {
  return (
    <section aria-label="Credentials" className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Credentials</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · verified
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
        <DniCard />
        <DriversLicenseCard />
        <AddCredentialCard />
      </div>
    </section>
  )
}

/* -------------------- Digital DNI -------------------- */
function DniCard() {
  return (
    <article
      className="relative h-[196px] w-[300px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/25 via-sky-400/10 to-slate-900/50 p-4 backdrop-blur-xl"
      aria-label="Digital DNI"
    >
      {/* Glass layers */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.06)_50%,transparent_60%)]" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-400/25 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-white/70">
            <span className="h-1 w-1 rounded-full bg-sky-300" />
            República Argentina
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            Documento Nacional
          </div>
          <div className="text-[11px] text-white/60">de Identidad · digital</div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10 backdrop-blur-md">
          <IdCard className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Identity row */}
      <div className="relative mt-5 flex items-end gap-3">
        <div
          className="h-14 w-11 rounded-md bg-gradient-to-br from-white/20 to-white/5 ring-1 ring-white/10"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-white">
            Tomás A. Fernández
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
            DNI · 38.492.110
          </div>
          <div className="mt-1 font-mono text-[10px] text-white/45">
            Exp. 12/2031
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
        <span className="flex items-center gap-1.5">
          <BadgeCheck className="h-3 w-3 text-sky-300" />
          verified on-chain
        </span>
        <span>zk-sig · 0x7a…e1</span>
      </div>
    </article>
  )
}

/* -------------------- Salta Driver's License -------------------- */
function DriversLicenseCard() {
  return (
    <article
      className="relative h-[196px] w-[300px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#7a1a1a]/70 via-[#3a0d0d]/60 to-[#1a0707]/80 p-4 backdrop-blur-xl"
      aria-label="Driver's License - Provincia de Salta"
    >
      {/* Glass + flare */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(255,205,120,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-amber-300/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-amber-200/80">
            <span className="h-1 w-1 rounded-full bg-amber-300" />
            Provincia de Salta
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            Licencia de Conducir
          </div>
          <div className="text-[11px] text-white/60">Clase B · vehicular</div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10 backdrop-blur-md">
          <CarFront className="h-4 w-4 text-amber-100" />
        </div>
      </div>

      {/* Identity row */}
      <div className="relative mt-5 flex items-end gap-3">
        <div className="relative h-14 w-11 overflow-hidden rounded-md bg-gradient-to-br from-amber-200/20 to-white/5 ring-1 ring-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,205,120,0.35),transparent_60%)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-white">
            Tomás A. Fernández
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
            Lic · SA-04-8821-392
          </div>
          <div className="mt-1 font-mono text-[10px] text-white/45">
            Vence 08/2029 · Salta Capital
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-amber-200" />
          gov · credential
        </span>
        <span>auto-renew · on</span>
      </div>
    </article>
  )
}

/* -------------------- Add card -------------------- */
function AddCredentialCard() {
  return (
    <button
      type="button"
      className="flex h-[196px] w-[200px] shrink-0 snap-center flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
        <Plus className="h-4 w-4" />
      </span>
      <span className="text-xs font-medium">Add credential</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
        passport · cuit · uni
      </span>
    </button>
  )
}
