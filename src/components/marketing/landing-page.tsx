import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, Upload } from "lucide-react";

import { CanaryLogo } from "@/components/branding/canary-logo";

type EntryFile = {
  name: string;
  rows: string;
  tag: string;
};

const ctaHrefStyle = {
  background: "var(--amber)",
  color: "#18120a",
  border: "none",
  borderRadius: 10,
  padding: "12px 18px",
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  whiteSpace: "nowrap",
} satisfies CSSProperties;

const heroCtaStyle = {
  ...ctaHrefStyle,
  padding: "18px 28px",
  fontSize: 16,
  gap: 12,
} satisfies CSSProperties;

const entryFiles: EntryFile[] = [
  { name: "hubspot-deals.csv", rows: "14,882 rows", tag: "salesforce export" },
  { name: "netsuite-recon-q2.csv", rows: "3,041 rows", tag: "finance close" },
  { name: "billing-invoices.csv", rows: "9,177 rows", tag: "billing drift" },
];

function Dot({ color = "var(--amber)", size = 6 }: { color?: string; size?: number }) {
  return <span aria-hidden="true" style={{ width: size, height: size, borderRadius: 9999, background: color, display: "inline-block" }} />;
}

function HeaderButton({
  href,
  children,
  large = false,
  className,
}: {
  href: string;
  children: ReactNode;
  large?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} style={large ? heroCtaStyle : ctaHrefStyle} className={className}>
      {children}
    </Link>
  );
}

function Lamp() {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1 / 1.05",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 45%, rgba(212,169,74,0.22), transparent 62%)",
        borderRadius: 10,
        border: "1px solid var(--line)",
      }}
    >
      <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
        <rect x="14" y="14" width="92" height="92" rx="6" fill="none" stroke="var(--amber)" strokeOpacity="0.35" strokeWidth="1" />
        <rect x="26" y="26" width="68" height="68" rx="4" fill="none" stroke="var(--amber)" strokeOpacity="0.55" strokeWidth="1" />
        <rect x="44" y="44" width="32" height="32" rx="2" fill="var(--amber)" />
        {[
          [10, 10],
          [104, 10],
          [10, 104],
          [104, 104],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx + 3} cy={cy + 3} r="1.2" fill="var(--amber)" />
        ))}
      </svg>
      <span
        className="font-mono-data"
        style={{
          position: "absolute",
          bottom: 8,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 9,
          letterSpacing: "0.16em",
          color: "var(--amber)",
        }}
      >
        CANARY · LAMP
      </span>
    </div>
  );
}

function HeroSignalPoster() {
  const rows = Array.from({ length: 64 }).map((_, i) => {
    const w = 24 + ((i * 37) % 56);
    const flagged = i === 18 || i === 41;
    const warn = i === 9 || i === 27 || i === 52;
    return { w, flagged, warn };
  });

  return (
    <div
      className="surface-grid"
      style={{
        position: "relative",
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: "32px 30px 28px",
        overflow: "hidden",
        backgroundImage: "radial-gradient(circle at 78% 14%, rgba(212,169,74,0.10), transparent 42%)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 26,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Dot />
          <span className="font-mono-data" style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--ink-dim)" }}>
            EARLY WARNING · SIGNAL FEED
          </span>
        </div>
        <span className="font-mono-data" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
          14:32:08
        </span>
      </div>

      <div
        style={{
          gap: 24,
          alignItems: "stretch",
        }}
        className="grid grid-cols-1 md:grid-cols-[150px_1fr]"
      >
        <Lamp />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 3,
            paddingLeft: 4,
          }}
        >
          {rows.map((r, i) => {
            const color = r.flagged ? "var(--bad)" : r.warn ? "var(--amber)" : "rgba(255,255,255,0.10)";
            const opacity = r.flagged || r.warn ? 1 : 0.6 + ((i % 5) * 0.06);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, height: 4 }}>
                <span
                  className="font-mono-data"
                  style={{
                    fontSize: 8,
                    color: r.flagged || r.warn ? color : "var(--ink-faint)",
                    width: 26,
                    opacity: r.flagged || r.warn ? 1 : 0.35,
                  }}
                >
                  {String(i * 47 + 1024).padStart(5, "0")}
                </span>
                <span
                  style={{
                    height: r.flagged || r.warn ? 3 : 2,
                    width: `${r.w}%`,
                    background: color,
                    opacity,
                    borderRadius: 1,
                  }}
                />
                {(r.flagged || r.warn) && (
                  <span
                    className="font-mono-data"
                    style={{
                      fontSize: 8,
                      letterSpacing: "0.06em",
                      color,
                      marginLeft: 4,
                    }}
                  >
                    {r.flagged ? "CRITICAL" : "WARN"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: 26,
          paddingTop: 20,
          borderTop: "1px solid var(--line)",
          gap: 18,
        }}
        className="grid grid-cols-1 sm:grid-cols-3"
      >
        {[
          ["ROWS SCANNED", "47,221"],
          ["FLAGS · 24H", "6", "var(--amber)"],
          ["ACCURACY", "99.82%"],
        ].map(([k, v, c]) => (
          <div key={k}>
            <div className="font-mono-data" style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.08em" }}>
              {k}
            </div>
            <div
              className="font-mono-data"
              style={{
                fontSize: 22,
                color: c || "var(--ink)",
                fontWeight: 500,
                marginTop: 4,
                letterSpacing: "-0.01em",
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepGlyph({ kind }: { kind: "upload" | "describe" | "watch" }) {
  const frame = (
    <>
      <rect x="0.5" y="0.5" width="119" height="119" rx="6" fill="none" stroke="var(--line)" />
      {[
        [10, 10, true],
        [110, 10, false],
        [10, 110, true],
        [110, 110, false],
      ].map(([x, y, lt], i) => (
        <g key={i} stroke="var(--amber)" strokeOpacity="0.55" strokeWidth="1">
          <line x1={(x as number) - ((lt as boolean) ? 0 : 6)} y1={y as number} x2={(x as number) + ((lt as boolean) ? 6 : 0)} y2={y as number} />
          <line x1={x as number} y1={(y as number) - ((y as number) < 60 ? 0 : 6)} x2={x as number} y2={(y as number) + ((y as number) < 60 ? 6 : 0)} />
        </g>
      ))}
    </>
  );

  if (kind === "upload") {
    return (
      <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
        {frame}
        <path d="M42 36 H70 L82 48 V90 H42 Z" fill="none" stroke="var(--amber)" strokeWidth="1.5" />
        <path d="M70 36 V48 H82" fill="none" stroke="var(--amber)" strokeWidth="1.5" />
        {[58, 66, 74, 82].map((y, i) => (
          <line
            key={i}
            x1="48"
            y1={y}
            x2={i === 2 ? 70 : 76}
            y2={y}
            stroke="var(--amber)"
            strokeOpacity={0.5 - i * 0.07}
            strokeWidth="1.2"
          />
        ))}
        <path d="M60 28 V18 M55 23 L60 18 L65 23" stroke="var(--amber)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "describe") {
    return (
      <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
        {frame}
        <path d="M28 42 H92 V78 H58 L48 88 V78 H28 Z" fill="none" stroke="var(--amber)" strokeWidth="1.5" />
        {[
          [36, 78],
          [36, 60],
          [36, 50],
        ].map(([x1, w], i) => (
          <line key={i} x1={x1 as number} y1={50 + i * 8} x2={(x1 as number) + (w as number)} y2={50 + i * 8} stroke="var(--amber)" strokeOpacity={0.7 - i * 0.15} strokeWidth="1.2" />
        ))}
        <line x1="80" y1="68" x2="80" y2="76" stroke="var(--amber)" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      {frame}
      {[10, 20, 30, 40].map((r, i) => (
        <circle key={i} cx="60" cy="60" r={r} fill="none" stroke="var(--amber)" strokeOpacity={0.65 - i * 0.13} strokeWidth="1.2" />
      ))}
      <circle cx="60" cy="60" r="3" fill="var(--amber)" />
      <line x1="60" y1="60" x2="92" y2="38" stroke="var(--bad)" strokeWidth="1.5" />
      <circle cx="92" cy="38" r="3" fill="var(--bad)" />
    </svg>
  );
}

function BoringChart() {
  const W = 520;
  const H = 280;
  const padX = 8;
  const midY = H / 2;

  const chaotic = [
    [0, 40],
    [55, -70],
    [110, 30],
    [165, -90],
    [220, 50],
    [275, -40],
    [330, 10],
    [385, -8],
    [440, 2],
    [W - padX, 0],
  ];
  const chaoticPath = "M" + chaotic.map(([x, dy]) => `${x + padX} ${midY + dy}`).join(" L ");
  const flatPath = `M${padX} ${midY} L${W - padX} ${midY}`;
  const quarters = ["Q1", "Q2", "Q3", "Q4", "Q1", "Q2", "Q3", "Q4"];
  const tickXs = quarters.map((_, i) => padX + ((W - padX * 2) / 7) * i);

  return (
    <div
      style={{
        position: "relative",
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: "28px 28px 22px",
        backgroundImage: "radial-gradient(circle at 80% 30%, rgba(212,169,74,0.08), transparent 55%)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <span className="font-mono-data" style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--ink-dim)" }}>
          ANOMALIES PER CLOSE
        </span>
        <span className="font-mono-data" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
          8 quarters
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <line x1={padX} y1={midY} x2={W - padX} y2={midY} stroke="var(--line-strong)" strokeDasharray="2 4" />

        <path
          d={chaoticPath}
          fill="none"
          stroke="var(--bad)"
          strokeOpacity="0.55"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {chaotic.slice(0, 6).map(([x, dy], i) => (
          <circle key={i} cx={x + padX} cy={midY + dy} r="2.2" fill="var(--bad)" opacity="0.7" />
        ))}

        <path d={flatPath} stroke="var(--amber)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx={W - padX} cy={midY} r="4" fill="var(--amber)" />

        <line
          x1={padX + ((W - padX * 2) / 7) * 3}
          y1={20}
          x2={padX + ((W - padX * 2) / 7) * 3}
          y2={H - 28}
          stroke="var(--amber)"
          strokeOpacity="0.4"
          strokeDasharray="2 3"
        />

        {tickXs.map((x, i) => (
          <g key={i}>
            <line x1={x} y1={H - 24} x2={x} y2={H - 20} stroke="var(--ink-faint)" />
            <text x={x} y={H - 8} fontFamily="JetBrains Mono" fontSize="9" fill="var(--ink-faint)" textAnchor="middle">
              {quarters[i]}
            </text>
          </g>
        ))}

        <text
          x={padX + ((W - padX * 2) / 7) * 3 + 8}
          y={28}
          fontFamily="JetBrains Mono"
          fontSize="9"
          fill="var(--amber)"
          letterSpacing="1"
        >
          CANARY STARTS →
        </text>
      </svg>

      <div
        style={{
          display: "flex",
          gap: 22,
          marginTop: 6,
          paddingTop: 14,
          borderTop: "1px solid var(--line)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 14, height: 2, background: "var(--bad)", opacity: 0.6, display: "inline-block" }} />
          <span className="font-mono-data" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
            BEFORE
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 14, height: 2, background: "var(--amber)", display: "inline-block" }} />
          <span className="font-mono-data" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
            WITH CANARY
          </span>
        </div>
      </div>
    </div>
  );
}

export function LandingPage({ hasWorkspace }: { hasWorkspace: boolean }) {
  const ctaHref = hasWorkspace ? "/projects" : "/signup";

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#0e0e10",
        color: "#f5f2eb",
      }}
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <header className="flex flex-wrap items-center justify-between gap-6 border-b border-white/8 px-4 py-6 md:px-12">
          <CanaryLogo variant="inline" surface="dark" showTagline={false} className="origin-left scale-[1.12]" />

          <div className="flex flex-wrap items-center gap-5">
            <Link href="/login" className="text-[13px] text-[var(--ink-dim)] transition-colors hover:text-white">
              Sign in
            </Link>
            <HeaderButton href={ctaHref} className="max-sm:w-full max-sm:justify-center">
              Drop a CSV <ArrowRight size={14} />
            </HeaderButton>
          </div>
        </header>

        <section className="border-b border-white/8 px-4 pb-24 pt-14 md:px-12">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_540px]">
            <div>
              <div
                className="font-mono-data"
                style={{
                  fontSize: 12,
                  color: "var(--amber)",
                  letterSpacing: "0.1em",
                  marginBottom: 36,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Dot />
                EARLY WARNING · FOR REV + FIN DATA OPS
              </div>

              <h1
                style={{
                  fontSize: 88,
                  lineHeight: 0.98,
                  fontWeight: 600,
                  maxWidth: "14ch",
                  marginBottom: 36,
                  letterSpacing: "-0.025em",
                }}
              >
                Stop finding out about data issues in{" "}
                <span style={{ color: "var(--amber)" }}>board meetings.</span>
              </h1>

              <p style={{ fontSize: 20, lineHeight: 1.55, color: "var(--ink-dim)", maxWidth: "46ch", marginBottom: 44 }}>
                Canary is the instrumental early warning system for CRM exports, reconciliations, and pipeline logic.
                Upload the file, define the checks in plain English, and catch the anomaly before it reaches the board
                deck.
              </p>

              <div className="flex">
                <HeaderButton href={ctaHref} large className="max-sm:w-full max-sm:justify-center">
                  Start now — drop a CSV <ArrowRight size={14} />
                </HeaderButton>
              </div>
            </div>

            <HeroSignalPoster />
          </div>
        </section>

        <section
          className="border-b border-white/8 px-4 py-[72px] md:px-12"
          style={{
            background: "radial-gradient(ellipse at top, rgba(255,201,101,0.04), transparent 55%)",
          }}
        >
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[320px_1fr] lg:gap-14">
            <div>
              <div
                className="font-mono-data"
                style={{
                  fontSize: 10,
                  color: "var(--ink-faint)",
                  letterSpacing: "0.08em",
                  marginBottom: 14,
                }}
              >
                01 · THE ENTRY POINT
              </div>
              <h2 style={{ fontSize: 32, lineHeight: 1.1, marginBottom: 14 }}>One CSV is the whole onboarding.</h2>
              <p style={{ fontSize: 14, color: "var(--ink-dim)", lineHeight: 1.6, maxWidth: "32ch" }}>
                No procurement, no SDK, no &ldquo;let&rsquo;s schedule scoping.&rdquo; The first file becomes the first
                audit, and the schema becomes the foundation for everything after.
              </p>
            </div>

            <div
              style={{
                border: "1.5px dashed rgba(255,201,101,0.45)",
                borderRadius: 14,
                background: "linear-gradient(180deg, rgba(255,201,101,0.04), transparent)",
                padding: "30px 28px 24px",
              }}
            >
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 10,
                    background: "var(--amber-soft)",
                    color: "var(--amber)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Upload size={18} />
                </div>
                <div className="md:flex-1">
                  <div style={{ fontSize: 17, fontWeight: 600 }}>Drop a CSV to start your first audit</div>
                  <div
                    className="font-mono-data"
                    style={{
                      fontSize: 11,
                      color: "var(--ink-faint)",
                      letterSpacing: "0.04em",
                      marginTop: 4,
                    }}
                  >
                    .csv, .xlsx, or .tsv · up to 250 MB · we never store unverified rows
                  </div>
                </div>
                <HeaderButton href={ctaHref} className="max-sm:w-full max-sm:justify-center">
                  Drop a CSV <ArrowRight size={14} />
                </HeaderButton>
              </div>

              <div className="grid grid-cols-1 gap-2 border-t border-[var(--line)] pt-4 md:grid-cols-3 md:gap-2">
                {entryFiles.map((file) => (
                  <div
                    key={file.name}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      padding: "10px 12px",
                      background: "rgba(255,255,255,0.015)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <Dot size={5} />
                      <span className="font-mono-data">{file.name}</span>
                    </div>
                    <div
                      className="font-mono-data"
                      style={{
                        fontSize: 10,
                        color: "var(--ink-faint)",
                        marginTop: 4,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {file.rows.toUpperCase()} · {file.tag.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 px-4 py-[84px] md:px-12">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div
                className="font-mono-data"
                style={{
                  fontSize: 10,
                  color: "var(--ink-faint)",
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}
              >
                02 · THE ARC
              </div>
              <h2 style={{ fontSize: 32, maxWidth: "22ch", lineHeight: 1.1 }}>
                Three minutes to the first flag. The rest is just watching.
              </h2>
            </div>
            <span className="font-mono-data" style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.06em" }}>
              UPLOAD → DESCRIBE → WATCH
            </span>
          </div>

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "8%",
                right: "8%",
                top: 60,
                height: 1,
                background: "linear-gradient(90deg, transparent, var(--line-strong) 12%, var(--line-strong) 88%, transparent)",
              }}
            />
            {[15, 35, 50, 70].map((pct) => (
              <div
                key={pct}
                style={{
                  position: "absolute",
                  left: `${pct}%`,
                  top: 58,
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--amber)",
                  opacity: 0.5,
                }}
              />
            ))}

            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-10">
              {[
                {
                  n: "01",
                  t: "Upload",
                  b: "We sniff the schema, map the columns, and remember them so the next file is just a re-run.",
                  kind: "upload" as const,
                  mono: "FILE INGESTED",
                },
                {
                  n: "02",
                  t: "Describe the checks",
                  b: "Write it the way you'd say it to the analyst on the other side of the desk. Canary compiles it into a durable rule.",
                  kind: "describe" as const,
                  mono: "RULE COMPILED",
                },
                {
                  n: "03",
                  t: "Watch",
                  b: "Every re-upload is re-audited. Deltas, anomalies, and policy breaks surface before the rollup ever moves.",
                  kind: "watch" as const,
                  mono: "MONITOR LIVE",
                },
              ].map((s) => (
                <div key={s.n} style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 122,
                      height: 122,
                      marginBottom: 28,
                      background: "var(--panel)",
                      borderRadius: 8,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <StepGlyph kind={s.kind} />
                  </div>

                  <div
                    className="font-mono-data"
                    style={{
                      fontSize: 11,
                      color: "var(--amber)",
                      letterSpacing: "0.08em",
                      marginBottom: 10,
                    }}
                  >
                    {s.n} / 03
                  </div>
                  <h3 style={{ fontSize: 22, marginBottom: 12 }}>{s.t}</h3>
                  <p style={{ fontSize: 14, color: "var(--ink-dim)", lineHeight: 1.6, maxWidth: "34ch", marginBottom: 16 }}>
                    {s.b}
                  </p>
                  <div
                    className="font-mono-data"
                    style={{
                      fontSize: 10,
                      color: "var(--ink-faint)",
                      letterSpacing: "0.1em",
                      paddingTop: 14,
                      borderTop: "1px solid var(--line)",
                    }}
                  >
                    → {s.mono}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 px-4 py-[84px] md:px-12">
          <div
            className="font-mono-data"
            style={{
              fontSize: 10,
              color: "var(--ink-faint)",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            03 · THE RULE LANGUAGE
          </div>
          <h2 style={{ fontSize: 38, maxWidth: "22ch", marginBottom: 44, lineHeight: 1.05 }}>
            Say it in plain English. Ship it as a durable check.
          </h2>

          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_64px_1fr] lg:gap-0">
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "28px 28px 26px",
                background: "var(--panel)",
              }}
            >
              <div
                className="font-mono-data"
                style={{
                  fontSize: 10,
                  color: "var(--ink-faint)",
                  letterSpacing: "0.1em",
                  marginBottom: 18,
                }}
              >
                YOU WRITE
              </div>
              <div style={{ fontSize: 20, lineHeight: 1.5, fontWeight: 500 }}>
                &ldquo;Flag any deal where the discount is above 40% on the enterprise tier, unless the owner is on the
                approved-exceptions list.&rdquo;
              </div>
              <div
                className="font-mono-data"
                style={{
                  fontSize: 11,
                  color: "var(--ink-faint)",
                  letterSpacing: "0.04em",
                  marginTop: 28,
                  paddingTop: 18,
                  borderTop: "1px solid var(--line)",
                }}
              >
                author: jess@acme.co · sept 14 · iteration 3
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <line x1="2" y1="22" x2="42" y2="22" stroke="var(--amber)" strokeWidth="1.2" strokeDasharray="3 3" />
                <path d="M32 14 L42 22 L32 30" stroke="var(--amber)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="2" cy="22" r="2" fill="var(--amber)" />
              </svg>
            </div>

            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "28px 28px 26px",
                background: "#0a0a0c",
              }}
            >
              <div
                className="font-mono-data"
                style={{
                  fontSize: 10,
                  color: "var(--amber)",
                  letterSpacing: "0.1em",
                  marginBottom: 18,
                }}
              >
                CANARY COMPILES
              </div>
              <pre
                className="font-mono-data whitespace-pre"
                style={{
                  fontSize: 13,
                  lineHeight: 1.75,
                  margin: 0,
                  color: "var(--ink-dim)",
                }}
              >{`rule discount_cap_enterprise {
  when tier = "Enterprise"
   and discount > 0.40
   and owner not_in approved_exceptions
  then severity = CRITICAL
       alert    = "#data-ops-alerts"
       attach   = deal_id, owner, acv
}`}</pre>
              <div
                className="font-mono-data"
                style={{
                  fontSize: 11,
                  color: "var(--ink-faint)",
                  letterSpacing: "0.04em",
                  marginTop: 22,
                  paddingTop: 18,
                  borderTop: "1px solid var(--line)",
                }}
              >
                compiled · versioned · diffable · 47 rules in this project
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 px-4 py-[96px] md:px-12">
          <div className="grid grid-cols-1 items-center gap-14 xl:grid-cols-[1fr_520px] xl:gap-20">
            <div>
              <div
                className="font-mono-data"
                style={{
                  fontSize: 10,
                  color: "var(--amber)",
                  letterSpacing: "0.08em",
                  marginBottom: 14,
                }}
              >
                04 · GET STARTED
              </div>
              <h2 style={{ fontSize: 56, maxWidth: "16ch", lineHeight: 1.04, fontWeight: 600 }}>
                Make the next close <span style={{ color: "var(--amber)" }}>boring.</span>
              </h2>
              <p style={{ fontSize: 15, color: "var(--ink-dim)", marginTop: 18, maxWidth: "52ch" }}>
                Instrument the file, author the rules, and let monitoring do its job before the downstream meeting ever
                starts.
              </p>
            </div>

            <BoringChart />
          </div>
        </section>

        <footer className="flex flex-col gap-5 px-4 py-[30px] text-[12px] text-[var(--ink-faint)] md:flex-row md:items-center md:justify-between md:px-12">
          <CanaryLogo variant="inline" surface="dark" showTagline={false} className="origin-left scale-[1.12]" />
          <div className="flex flex-wrap gap-7">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="/security" className="transition-colors hover:text-white">
              Security
            </Link>
            <Link href="/docs" className="transition-colors hover:text-white">
              Docs
            </Link>
            <Link href="/status" className="transition-colors hover:text-white">
              Status
            </Link>
          </div>
          <span className="font-mono-data">© 2026 Canary Instrumentation</span>
        </footer>
      </div>
    </main>
  );
}
