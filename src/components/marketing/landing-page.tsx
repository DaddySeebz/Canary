import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BellRing,
  BrainCircuit,
  CheckCircle2,
  FolderSearch2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { CanaryLogo } from "@/components/branding/canary-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const comparisonCards = [
  {
    eyebrow: "The status quo",
    title: "Manual Monday audit",
    points: [
      "Ops reviews exports after the board packet already moved.",
      "Anomaly review lives in a spreadsheet and tribal memory.",
      "Corrections arrive after leadership already saw the number.",
    ],
    result: "Result: perpetual friction",
  },
  {
    eyebrow: "The Canary way",
    title: "Automated early warning",
    points: [
      "Rule logic watches every CSV and reconciliation feed.",
      "Risky deltas surface before they reach the executive rollup.",
      "Audit context, remediation notes, and ownership stay attached.",
    ],
    result: "Result: total control",
  },
];

const pillars = [
  {
    eyebrow: "Anomaly detection",
    title: "Early warning, not late discovery",
    body:
      "Detect drift the moment the pipeline stops behaving like itself, not after a broken export has already cascaded downstream.",
  },
  {
    eyebrow: "Audit-ready",
    title: "Timestamped proof",
    body: "Keep a defensible record of what changed, when it changed, and who resolved it.",
  },
  {
    eyebrow: "Process logic",
    title: "Policy encoded once",
    body: "Turn natural-language monitoring instructions into durable checks that stay close to the data.",
  },
  {
    eyebrow: "Quantifiable relief",
    title: "Give executive time back",
    body: "Translate recurring data damage into hours saved, risk reduced, and confidence restored.",
  },
];

function Panel({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="glass-panel rounded-[0.75rem] border border-white/8 p-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/90">{eyebrow}</div>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-zinc-300">{body}</p>
    </div>
  );
}

export function LandingPage({
  hasWorkspace,
  hasPublicDemo = false,
}: {
  hasWorkspace: boolean;
  hasPublicDemo?: boolean;
}) {
  const primaryHref = hasWorkspace ? "/projects" : "/signup";

  return (
    <main className="min-h-[100dvh] px-4 py-5 md:px-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <header className="glass-panel rounded-[0.75rem] border border-white/10 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <CanaryLogo variant="inline" showTagline={false} />
            <nav className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
              <a href="#monitoring" className="hover:text-white">
                Monitoring
              </a>
              <a href="#intelligence" className="hover:text-white">
                Intelligence
              </a>
              <a href="#alerts" className="hover:text-white">
                Alerting
              </a>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              {hasPublicDemo ? (
                <Link href="/demo" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
                  Open demo workspace
                </Link>
              ) : null}
              <Link href={primaryHref} className={cn(buttonVariants({ size: "lg" }), "min-w-[220px]")}>
                Start your first audit
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="glass-panel canary-grid rounded-[0.9rem] border border-white/10 px-8 py-10">
            <div className="max-w-[34rem] space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-amber-100">
                Built for revenue and finance data ops
              </div>
              <div className="space-y-4">
                <h1 className="max-w-[11ch] text-5xl font-semibold tracking-tight text-white md:text-7xl">
                  Stop finding out about data issues in <span className="text-primary">board meetings.</span>
                </h1>
                <p className="max-w-[60ch] text-base leading-8 text-zinc-300 md:text-lg">
                  Canary is the instrumental early warning system for CRM exports, reconciliations, and pipeline logic.
                  Upload the file, define the checks in plain English, and catch the anomaly before it reaches the board deck.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={primaryHref} className={cn(buttonVariants({ size: "lg" }))}>
                  Start your first audit
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {hasPublicDemo ? (
                  <Link href="/demo" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
                    Open demo workspace
                  </Link>
                ) : null}
                <a href="#monitoring" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
                  See the platform
                </a>
              </div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Start with one CSV. No integration required.
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[0.9rem] border border-white/10 p-6">
            <div className="rounded-[0.75rem] border border-white/8 bg-[#121214] p-5 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[0.75rem] bg-amber-400/12 text-primary">
                    <BellRing className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Live stream</div>
                    <div className="text-lg font-semibold text-white">Global revenue pipeline</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="h-2 w-2 rounded-full bg-white/15" />
                  <span className="h-2 w-2 rounded-full bg-white/15" />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="rounded-[0.75rem] border border-[#3d1f1d] bg-[#231717] px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-[#ffb2ae]">Critical: logic violation</div>
                      <div className="text-sm text-zinc-300">Discount &gt; 40% on enterprise tier</div>
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[#ff8f88]">02s ago</div>
                  </div>
                </div>
                {[
                  "Canary rule pack refreshed for Q2 close",
                  "Revenue sync anomaly auto-resolved",
                  "NetSuite mapping remains healthy",
                ].map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-[0.75rem] bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                      <span className={cn("h-2 w-2 rounded-full", index === 2 ? "bg-emerald-400" : "bg-primary")} />
                      {item}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{index === 0 ? "14m ago" : index === 1 ? "21m ago" : "now"}</div>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex items-end justify-between border-t border-white/8 pt-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Quarterly accuracy</div>
                  <div className="mt-2 font-mono text-4xl text-primary">99.82%</div>
                </div>
                <div className="flex h-12 items-end gap-2">
                  {[24, 30, 36, 48, 40].map((height) => (
                    <span key={height} className="w-2 rounded-full bg-primary/85" style={{ height }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="monitoring" className="grid gap-6 lg:grid-cols-2">
          {comparisonCards.map((card) => (
            <div key={card.title} className="glass-panel rounded-[0.9rem] border border-white/10 p-7">
              <div className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">{card.eyebrow}</div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">{card.title}</h2>
              <div className="mt-6 space-y-3">
                {card.points.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-[0.75rem] bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <div className="mt-7 border-t border-white/8 pt-4 text-xs uppercase tracking-[0.22em] text-primary">
                {card.result}
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]" id="alerts">
          <Panel
            eyebrow="Execution for the operator"
            title="From spreadsheet operator to strategic partner"
            body="Canary gives operations teams the signal discipline of a modern control room. Less reactive cleanup, more confident leadership support."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className={cn(
                  "glass-panel rounded-[0.75rem] border border-white/8 p-5",
                  index === 0 && "sm:col-span-2",
                )}
              >
                <div className="text-[11px] uppercase tracking-[0.24em] text-primary">{pillar.eyebrow}</div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-300">{pillar.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]" id="intelligence">
          <div className="glass-panel rounded-[0.9rem] border border-white/10 p-8">
            <div className="text-[11px] uppercase tracking-[0.28em] text-primary">Execution by the operator</div>
            <h2 className="mt-4 max-w-[15ch] text-4xl font-semibold tracking-tight text-white">
              Secure your board deck before the number hardens.
            </h2>
            <p className="mt-4 max-w-[60ch] text-sm leading-7 text-zinc-300">
              The first audit should take minutes, not a procurement cycle. Canary exists to protect trust in the number and restore calm to the operator running the pipeline.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: FolderSearch2, label: "Audits", value: "Mapped schema" },
                { icon: Activity, label: "Monitoring", value: "Live drift signal" },
                { icon: BrainCircuit, label: "Intelligence", value: "Operational memory" },
              ].map((item) => (
                <div key={item.label} className="rounded-[0.75rem] bg-white/[0.03] p-4">
                  <item.icon className="h-5 w-5 text-primary" />
                  <div className="mt-5 text-xs uppercase tracking-[0.2em] text-zinc-500">{item.label}</div>
                  <div className="mt-2 text-base font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-[0.9rem] border border-white/10 p-7">
            <div className="rounded-[0.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-[0.75rem] bg-primary/12 text-primary">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">Audit confidence snapshot</div>
                  <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Instrumental precision</div>
                </div>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[0.75rem] bg-black/20 p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Median response time</div>
                  <div className="mt-4 font-mono text-4xl text-white">14m</div>
                  <p className="mt-3 text-sm text-zinc-400">Time between detection and action across the latest signal cycle.</p>
                </div>
                <div className="rounded-[0.75rem] bg-primary/12 p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#c07a1c]">Recovered leadership time</div>
                  <div className="mt-4 font-mono text-4xl text-[#fff4dc]">47h</div>
                  <p className="mt-3 text-sm text-[#f0d8a1]">Projected time returned to RevOps and finance operations every quarter.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[0.9rem] border border-primary/20 px-8 py-9">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-primary">Final CTA</div>
              <h2 className="max-w-[14ch] text-4xl font-semibold tracking-tight text-white">
                Create your first Canary workspace and make the next close boring.
              </h2>
              <p className="max-w-[58ch] text-sm leading-7 text-zinc-300">
                Instrument the file, author the rules, and let monitoring do its job before the downstream meeting ever starts.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <Link href={primaryHref} className={cn(buttonVariants({ size: "lg" }), "min-w-[220px]")}>
                Create your account
              </Link>
              <a href="#monitoring" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
                Review the workflow
              </a>
            </div>
          </div>
        </section>

        <footer className="glass-panel rounded-[0.9rem] border border-white/10 p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <div className="space-y-4">
              <CanaryLogo variant="inline" showTagline={false} />
              <p className="max-w-[38ch] text-sm leading-7 text-zinc-400">
                Precision instrumentation for revenue and finance operations. Build trust in the number before it reaches the room that matters.
              </p>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">Platform</div>
              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div>Product overview</div>
                <div>Manual audit tool</div>
                <div>Live monitoring</div>
                <div>Process logic</div>
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">Company</div>
              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div>White papers</div>
                <div>RevOps report 2026</div>
                <Link href="/privacy" className="hover:text-white">
                  Privacy policy
                </Link>
                <Link href="/terms" className="hover:text-white">
                  Terms of service
                </Link>
                <Link href="/security" className="hover:text-white">
                  Security
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5 text-xs uppercase tracking-[0.22em] text-zinc-500">
            <span>© 2026 Canary Instrumentation</span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Network uptime 99.982
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
