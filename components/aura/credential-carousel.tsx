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
      className="relative h-[196px] w-[300px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#00a19b]/35 via-[#00a19b]/12 to-[#0a1a1a]/70 p-4 backdrop-blur-xl"
      aria-label="Digital DNI"
    >
      {/* Glass layers */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(228,221,211,0.14),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(228,221,211,0.07)_50%,transparent_60%)]" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#00a19b]/35 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#e4ddd3]/75">
            <span className="h-1 w-1 rounded-full bg-[#6ad3cd]" />
            República Argentina
          </div>
          <div className="mt-1 text-sm font-semibold text-[#e4ddd3]">
            Documento Nacional
          </div>
          <div className="text-[11px] text-[#e4ddd3]/60">
            de Identidad · digital
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10 backdrop-blur-md">
          <IdCard className="h-4 w-4 text-[#e4ddd3]" />
        </div>
      </div>

      {/* Identity row */}
      <div className="relative mt-5 flex items-end gap-3">
        <div
          className="h-14 w-11 rounded-md bg-gradient-to-br from-[#e4ddd3]/25 to-white/5 ring-1 ring-white/10"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-[#e4ddd3]">
            Tomás A. Fernández
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e4ddd3]/55">
            DNI · 38.492.110
          </div>
          <div className="mt-1 font-mono text-[10px] text-[#e4ddd3]/45">
            Exp. 12/2031
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#e4ddd3]/55">
        <span className="flex items-center gap-1.5">
          <BadgeCheck className="h-3 w-3 text-[#6ad3cd]" />
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
      className="relative h-[196px] w-[300px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#e4ddd3]/30 via-[#c9bfad]/15 to-[#1a1612]/80 p-4 backdrop-blur-xl"
      aria-label="Driver's License - Provincia de Salta"
    >
      {/* Glass + flare */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(228,221,211,0.22),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-[#00a19b]/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#e4ddd3]/80">
            <span className="h-1 w-1 rounded-full bg-[#e4ddd3]" />
            Provincia de Salta
          </div>
          <div className="mt-1 text-sm font-semibold text-[#e4ddd3]">
            Licencia de Conducir
          </div>
          <div className="text-[11px] text-[#e4ddd3]/60">
            Clase B · vehicular
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10 backdrop-blur-md">
          <CarFront className="h-4 w-4 text-[#e4ddd3]" />
        </div>
      </div>

      {/* Identity row */}
      <div className="relative mt-5 flex items-end gap-3">
        <div className="relative h-14 w-11 overflow-hidden rounded-md bg-gradient-to-br from-[#e4ddd3]/25 to-white/5 ring-1 ring-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,161,155,0.35),transparent_60%)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-[#e4ddd3]">
            Tomás A. Fernández
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e4ddd3]/55">
            Lic · SA-04-8821-392
          </div>
          <div className="mt-1 font-mono text-[10px] text-[#e4ddd3]/45">
            Vence 08/2029 · Salta Capital
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#e4ddd3]/55">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-[#6ad3cd]" />
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
