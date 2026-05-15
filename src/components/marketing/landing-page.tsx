import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, FileUp, MessageSquareText, Sparkles, Target } from "lucide-react";

import { CanaryLogo } from "@/components/branding/canary-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EntryFile = {
  name: string;
  meta: string;
};

type ArcStep = {
  number: string;
  title: string;
  body: string;
  footer: string;
  icon: LucideIcon;
};

type ComparisonSeries = {
  label: string;
  tone: "danger" | "gold";
  values: number[];
};

const entryFiles: EntryFile[] = [
  { name: "hubspot-deals.csv", meta: "14,882 ROWS · SALESFORCE EXPORT" },
  { name: "netsuite-recon-q2.csv", meta: "3,041 ROWS · FINANCE CLOSE" },
  { name: "billing-invoices.csv", meta: "9,177 ROWS · BILLING DRIFT" },
];

const arcSteps: ArcStep[] = [
  {
    number: "01 / 03",
    title: "Upload",
    body: "We sniff the schema, map the columns, and remember them so the next file is just a re-run.",
    footer: "→ FILE INGESTED",
    icon: FileUp,
  },
  {
    number: "02 / 03",
    title: "Describe the checks",
    body: "Write it the way you'd say it to the analyst on the other side of the desk. Canary compiles it into a durable rule.",
    footer: "→ RULE COMPILED",
    icon: MessageSquareText,
  },
  {
    number: "03 / 03",
    title: "Watch",
    body: "Every re-upload is re-audited. Deltas, anomalies, and policy breaks surface before the rollup ever moves.",
    footer: "→ MONITOR LIVE",
    icon: Target,
  },
];

const comparisonSeries: ComparisonSeries[] = [
  {
    label: "BEFORE",
    tone: "danger",
    values: [78, 86, 74, 90, 84, 96, 88, 100],
  },
  {
    label: "WITH CANARY",
    tone: "gold",
    values: [28, 24, 22, 20, 18, 16, 14, 12],
  },
];

function SignalFeedPanel() {
  const gridLines = Array.from({ length: 24 }, (_, index) => 92 + index * 14);
  const markers = [
    { label: "B1447", x: 148, y: 158 },
    { label: "B1878", x: 148, y: 244 },
    { label: "B2951", x: 148, y: 330 },
    { label: "B3468", x: 148, y: 414 },
  ];

  return (
    <div className="surface-grid relative flex min-h-[560px] flex-col overflow-hidden rounded-[1rem] border border-white/10 bg-[#121214] shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between px-6 pt-6 text-[11px] uppercase tracking-[0.26em] text-zinc-500">
        <span className="inline-flex items-center gap-2 text-amber-100/90">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          EARLY WARNING · SIGNAL FEED
        </span>
        <span className="font-mono-data">14:32:08</span>
      </div>

      <div className="flex-1 px-4 pb-4 pt-8">
        <svg viewBox="0 0 760 520" className="h-full w-full" aria-hidden="true">
          <rect x="60" y="52" width="640" height="416" rx="24" fill="none" stroke="rgba(255,255,255,0.08)" />
          <rect x="110" y="92" width="540" height="336" rx="30" fill="none" stroke="#d4a94a" strokeOpacity="0.6" strokeWidth="3" />
          <rect x="166" y="140" width="428" height="242" rx="24" fill="none" stroke="#d4a94a" strokeOpacity="0.48" strokeWidth="3" />
          <rect x="286" y="182" width="162" height="122" rx="10" fill="#e0bb61" />

          {gridLines.map((y) => (
            <line key={y} x1="180" y1={y} x2="626" y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          ))}

          <line x1="166" y1="154" x2="628" y2="154" stroke="#d4a94a" strokeOpacity="0.92" strokeWidth="3" />
          <line x1="166" y1="240" x2="628" y2="240" stroke="#e5726d" strokeOpacity="0.95" strokeWidth="3" />
          <line x1="166" y1="326" x2="628" y2="326" stroke="#d4a94a" strokeOpacity="0.85" strokeWidth="3" />
          <line x1="166" y1="390" x2="628" y2="390" stroke="#d4a94a" strokeOpacity="0.85" strokeWidth="3" />

          {markers.map((marker) => (
            <g key={marker.label}>
              <circle cx="160" cy={marker.y} r="5" fill="#d4a94a" />
              <text
                x={marker.x}
                y={marker.y + 4}
                fill="#d4a94a"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
                fontSize="10"
                letterSpacing="3"
              >
                {marker.label}
              </text>
            </g>
          ))}

          <g fill="rgba(255,255,255,0.08)">
            {Array.from({ length: 13 }, (_, index) => (
              <circle key={index} cx={252 + index * 30} cy={114 + (index % 2) * 10} r="1.6" />
            ))}
          </g>

          <text
            x="630"
            y="158"
            fill="#d4a94a"
            fontFamily="JetBrains Mono, ui-monospace, monospace"
            fontSize="11"
            letterSpacing="3"
          >
            WARN
          </text>
          <text
            x="630"
            y="244"
            fill="#e5726d"
            fontFamily="JetBrains Mono, ui-monospace, monospace"
            fontSize="11"
            letterSpacing="3"
          >
            CRITICAL
          </text>
          <text
            x="630"
            y="330"
            fill="#d4a94a"
            fontFamily="JetBrains Mono, ui-monospace, monospace"
            fontSize="11"
            letterSpacing="3"
          >
            WARN
          </text>
          <text
            x="630"
            y="394"
            fill="#d4a94a"
            fontFamily="JetBrains Mono, ui-monospace, monospace"
            fontSize="11"
            letterSpacing="3"
          >
            WARN
          </text>

          <text
            x="228"
            y="432"
            fill="#d4a94a"
            fontFamily="JetBrains Mono, ui-monospace, monospace"
            fontSize="11"
            letterSpacing="4"
          >
            CANARY · LAMP
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-white/8 px-6 py-5">
        <Stat label="ROWS SCANNED" value="47,221" />
        <Stat label="FLAGS · 24H" value="6" />
        <Stat label="ACCURACY" value="99.82%" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{label}</div>
      <div className="font-mono-data text-2xl text-white sm:text-3xl">{value}</div>
    </div>
  );
}

function EntryPointFileCard({ file }: { file: EntryFile }) {
  return (
    <div className="rounded-[0.75rem] border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="text-sm font-semibold text-white">{file.name}</div>
      <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-zinc-500">{file.meta}</div>
    </div>
  );
}

function ComparisonChart() {
  return (
    <div className="rounded-[0.9rem] border border-white/10 bg-[#121214] p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">ANOMALIES PER CLOSE</div>
        <div className="text-[11px] uppercase tracking-[0.24em] text-primary">8 quarters</div>
      </div>

      <div className="mt-6 space-y-6">
        {comparisonSeries.map((series) => (
          <div key={series.label} className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">{series.label}</div>
            <div className="grid h-24 grid-cols-8 items-end gap-2">
              {series.values.map((value, index) => (
                <div
                  key={`${series.label}-${index}`}
                  className={cn(
                    "rounded-full",
                    series.tone === "danger" ? "bg-[#e5726d]/80" : "bg-primary/85",
                  )}
                  style={{ height: `${value}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-6 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
        <span>BEFORE</span>
        <span>WITH CANARY</span>
      </div>
    </div>
  );
}

export function LandingPage({
  hasWorkspace,
}: {
  hasWorkspace: boolean;
}) {
  const ctaHref = hasWorkspace ? "/projects" : "/signup";

  return (
    <main className="min-h-[100dvh] bg-[#0e0e10] px-4 py-5 text-[#f5f2eb] md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-wrap items-center justify-between gap-6 border-b border-white/8 py-5">
          <CanaryLogo variant="inline" surface="dark" showTagline={false} />
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Sign in
            </Link>
            <Link
              href={ctaHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "max-sm:w-full max-sm:justify-center sm:min-w-[220px]",
              )}
            >
              Drop a CSV
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="grid gap-10 border-b border-white/8 py-14 lg:grid-cols-[1fr_0.94fr] lg:gap-12 lg:py-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200/90">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              EARLY WARNING · FOR REV + FIN DATA OPS
            </div>
            <h1 className="max-w-[11ch] text-5xl font-semibold leading-[0.92] tracking-tight text-white sm:text-6xl md:text-[4.9rem]">
              Stop finding out about data issues in <span className="text-primary">board meetings.</span>
            </h1>
            <p className="max-w-[39rem] text-base leading-8 text-zinc-300 md:text-lg">
              Canary is the instrumental early warning system for CRM exports, reconciliations, and pipeline logic.
              Upload the file, define the checks in plain English, and catch the anomaly before it reaches the board
              deck.
            </p>
            <Link
              href={ctaHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "max-sm:w-full max-sm:justify-center sm:min-w-[240px]",
              )}
            >
              Start now — drop a CSV
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <SignalFeedPanel />
        </section>

        <section className="border-b border-white/8 py-16">
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <div className="space-y-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">01 · THE ENTRY POINT</div>
              <h2 className="max-w-[13ch] text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl">
                One CSV is the whole onboarding.
              </h2>
              <p className="max-w-[28rem] text-sm leading-7 text-zinc-400">
                No procurement, no SDK, no &ldquo;let&apos;s schedule scoping.&rdquo; The first file becomes the
                first audit, and the schema becomes the foundation for everything after.
              </p>
            </div>

            <div className="rounded-[0.9rem] border border-primary/20 bg-[#141416] p-6 shadow-[0_30px_80px_-55px_rgba(0,0,0,0.85)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[0.75rem] border border-white/10 bg-black/25 text-primary">
                    <FileUp className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-lg font-semibold text-white">Drop a CSV to start your first audit</div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                      .csv, .xlsx, or .tsv · up to 250 MB · we never store unverified rows
                    </div>
                  </div>
                </div>
                <Link
                  href={ctaHref}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "max-sm:w-full max-sm:justify-center sm:min-w-[168px]",
                  )}
                >
                  Drop a CSV
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {entryFiles.map((file) => (
                  <EntryPointFileCard key={file.name} file={file} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">02 · THE ARC</div>
              <h2 className="max-w-[16ch] text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl">
                Three minutes to the first flag. The rest is just watching.
              </h2>
            </div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">UPLOAD → DESCRIBE → WATCH</div>
          </div>

          <div className="relative mt-10 grid gap-5 lg:grid-cols-3">
            <div className="absolute left-8 right-8 top-12 hidden h-px bg-white/8 lg:block" />
            {arcSteps.map((step) => (
              <div
                key={step.title}
                className="relative rounded-[0.75rem] border border-white/8 bg-white/[0.03] p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[0.75rem] border border-white/10 bg-[#121214] text-primary">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <div className="text-xs uppercase tracking-[0.22em] text-primary">{step.number}</div>
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-300">{step.body}</p>
                <div className="mt-6 border-t border-white/8 pt-4 text-xs uppercase tracking-[0.22em] text-zinc-500">
                  {step.footer}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/8 py-16">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[0.9rem] border border-white/10 bg-[#121214] p-6">
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">03 · THE RULE LANGUAGE</div>
              <h2 className="mt-4 max-w-[16ch] text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl">
                Say it in plain English. Ship it as a durable check.
              </h2>

              <div className="mt-6 rounded-[0.75rem] border border-white/8 bg-black/25 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">YOU WRITE</div>
                <p className="mt-4 text-base leading-8 text-zinc-100">
                  &ldquo;Flag any deal where the discount is above 40% on the enterprise tier, unless the owner is on
                  the approved-exceptions list.&rdquo;
                </p>
                <div className="mt-4 font-mono-data text-xs uppercase tracking-[0.2em] text-zinc-500">
                  author: jess@acme.co · sept 14 · iteration 3
                </div>
              </div>
            </div>

            <div className="rounded-[0.9rem] border border-white/10 bg-[#121214] p-6">
              <div className="text-xs uppercase tracking-[0.28em] text-primary">CANARY COMPILES</div>
              <pre className="mt-5 overflow-x-auto rounded-[0.75rem] border border-white/8 bg-black/25 p-5 font-mono-data text-[12px] leading-6 text-zinc-200">
                {`rule discount_cap_enterprise {
  when tier = "Enterprise"
    and discount > 0.40
    and owner not_in approved_exceptions
  then severity = CRITICAL
    alert = "#data-ops-alerts"
    attach = deal_id, owner, acv
}`}
              </pre>
              <div className="mt-5 text-xs uppercase tracking-[0.24em] text-zinc-500">
                compiled · versioned · diffable · 47 rules in this project
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 py-16">
          <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr] lg:items-end">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">04 · GET STARTED</div>
              <h2 className="max-w-[15ch] text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">
                Make the next close boring.
              </h2>
              <p className="max-w-[34rem] text-sm leading-7 text-zinc-300">
                Instrument the file, author the rules, and let monitoring do its job before the downstream meeting
                ever starts.
              </p>
            </div>

            <ComparisonChart />
          </div>
        </section>

        <footer className="py-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <div className="space-y-4">
              <CanaryLogo variant="inline" surface="dark" showTagline={false} />
              <p className="max-w-[38ch] text-sm leading-7 text-zinc-400">
                Precision instrumentation for revenue and finance operations. Build trust in the number before it
                reaches the room that matters.
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
                <Link href="/privacy" className="block transition-colors hover:text-white">
                  Privacy policy
                </Link>
                <Link href="/terms" className="block transition-colors hover:text-white">
                  Terms of service
                </Link>
                <Link href="/security" className="block transition-colors hover:text-white">
                  Security
                </Link>
                <Link href="/docs" className="block transition-colors hover:text-white">
                  Docs
                </Link>
                <Link href="/status" className="block transition-colors hover:text-white">
                  Status
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
