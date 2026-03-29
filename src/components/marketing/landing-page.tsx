import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bot,
  CheckCircle2,
  Clock3,
  FolderSearch2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { CanaryLogo } from "@/components/branding/canary-logo";
import { DeploymentBanner } from "@/components/layout/deployment-banner";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ProjectCard } from "@/components/projects/project-card";
import { buttonVariants } from "@/components/ui/button";
import type { ProjectSummary } from "@/lib/db/types";
import { cn } from "@/lib/utils";

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="space-y-3">
      <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/90">{eyebrow}</div>
      <h2 className="max-w-[16ch] text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      <p className="max-w-[62ch] text-sm leading-7 text-muted-foreground md:text-base">{body}</p>
    </div>
  );
}

export function LandingPage({ projects }: { projects: ProjectSummary[] }) {
  const primaryProject = projects[0] ?? null;
  const dashboardHref = primaryProject ? `/projects/${primaryProject.id}` : null;
  const setupHref = primaryProject ? `/projects/${primaryProject.id}/setup` : null;
  const historyHref = primaryProject ? `/projects/${primaryProject.id}/history` : null;

  const personas = [
    {
      title: "The Revenue Operator",
      role: "RevOps / Revenue Operations",
      description:
        "Lives inside Salesforce, HubSpot, Clari, and spreadsheets. Measures themselves by whether leadership trusts the number.",
      stats: ["Series B-D", "100-1,000 employees", "Reports to CRO or VP Sales"],
    },
    {
      title: "The Sales Architect",
      role: "SalesOps / Sales Operations",
      description:
        "Knows where the process breaks, carries the Monday audit, and gets pulled in every time the forecast looks off.",
      stats: ["Series A-D", "50-2,000 employees", "Champion buyer"],
    },
    {
      title: "The Finance Controller",
      role: "FinOps / Finance Operations",
      description:
        "Owns financial truth, auditability, and the downstream fallout when exports, mappings, or reconciliations drift.",
      stats: ["Series B-D", "100-2,000 employees", "Reports to CFO or VP Finance"],
    },
  ];

  const triggers = [
    {
      icon: AlertTriangle,
      title: 'The "never again" incident',
      body: "A bad number makes it into a board deck, forecast call, or leadership review. That embarrassment creates immediate buying intent.",
    },
    {
      icon: Clock3,
      title: "The scaling threshold",
      body: "The spreadsheet audit that used to take 20 minutes now eats a whole morning and still misses things.",
    },
    {
      icon: ShieldCheck,
      title: "Executive trust pressure",
      body: 'A CRO or CFO says, "I need to trust this number before the meeting." The ops lead now has urgency and permission to act.',
    },
    {
      icon: BadgeCheck,
      title: "New leader scrutiny",
      body: "A new VP or CFO questions process quality on day one, and the ops team needs a defensible system fast.",
    },
  ];

  const dealKillers = [
    "Anything that requires engineering or IT to get started",
    "Vague ROI language instead of concrete time-saved and risk-avoided outcomes",
    "Enterprise-heavy setup that adds work before delivering value",
    "Messaging that sounds like governance software instead of operational protection",
  ];

  const workflowCards = [
    {
      title: "Setup",
      subtitle: "Ground the rules in the real file context",
      body: "Upload CSVs, inspect the columns, and define checks in plain English. The setup page makes the AI feel visible and controlled.",
      href: setupHref,
      cta: primaryProject ? "Open setup" : "Create a workspace to unlock setup",
      icon: Bot,
    },
    {
      title: "Dashboard",
      subtitle: "Triage the damage in under 10 seconds",
      body: "The dashboard is built for the moment after the audit finishes: severity first, impact counts next, and resolution paths close behind.",
      href: dashboardHref,
      cta: primaryProject ? "View dashboard" : "Create a workspace to unlock dashboard",
      icon: FolderSearch2,
    },
    {
      title: "History",
      subtitle: "Keep the audit trail without rebuilding it",
      body: "Uploads, rule changes, audits, and generated insights roll into one timeline that supports accountability and review.",
      href: historyHref,
      cta: primaryProject ? "Open history" : "Create a workspace to unlock history",
      icon: Sparkles,
    },
  ];

  return (
    <main className="min-h-[100dvh] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <DeploymentBanner />

        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,oklch(0.17_0.01_75),oklch(0.13_0.005_75)_58%,oklch(0.16_0.03_72))] px-6 py-8 md:px-10 md:py-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] lg:block">
            <div className="absolute right-8 top-8 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.26),transparent_68%)] blur-3xl" />
            <div className="absolute bottom-8 right-10 flex h-[26rem] w-[22rem] items-center justify-center rounded-[2.75rem] border border-amber-300/12 bg-[linear-gradient(180deg,rgba(251,191,36,0.1),rgba(15,12,7,0.04))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <CanaryLogo variant="mark" className="h-[15rem] w-[15rem]" />
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative z-10 max-w-[46rem] space-y-7">
              <CanaryLogo variant="stacked" className="max-w-[24rem]" />

              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/18 bg-amber-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-amber-100">
                Built for RevOps, SalesOps, and Finance Ops
              </div>

              <div className="space-y-4">
                <h1 className="max-w-[13ch] text-4xl font-semibold tracking-tight md:text-6xl">
                  Stop finding out about data problems in board meetings.
                </h1>
                <p className="max-w-[62ch] text-base leading-8 text-muted-foreground md:text-lg">
                  Canary gives operations teams an early warning system for bad CRM exports, broken reconciliations,
                  missing fields, and recurring process drift. Upload the file, describe the checks in plain English,
                  and catch the problem before leadership sees the number.
                </p>
              </div>

              <div id="conversion" className="flex flex-wrap items-center gap-3">
                <CreateProjectDialog triggerLabel="Start your first workspace" />
                {dashboardHref ? (
                  <Link href={dashboardHref} className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
                    See a live workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <a href="#workflow" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
                    See the workflow
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">What resonates</div>
                  <div className="mt-3 text-sm leading-7 text-foreground">
                    &ldquo;Catch CRM errors before they hit a leadership deck.&rdquo;
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">What closes</div>
                  <div className="mt-3 text-sm leading-7 text-foreground">
                    Fast time-to-value, no engineering required, and an audit trail ops can defend.
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-4 lg:items-end">
              <div className="w-full rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] lg:max-w-[25rem]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Why they buy</div>
                    <div className="mt-2 text-lg font-semibold">Relief, not hype</div>
                  </div>
                  <div className="rounded-full border border-amber-300/18 bg-amber-400/10 px-3 py-1 font-mono text-xs text-amber-100">
                    Time to value
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    "Automate the audit the team runs manually every Monday.",
                    "Get the issue count, root signal, and next action in one view.",
                    "Keep the ops team strategic instead of stuck in spreadsheet triage.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-black/10 px-4 py-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-200" />
                      <div className="text-sm leading-6 text-muted-foreground">{item}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid w-full gap-4 sm:grid-cols-[1.1fr_0.9fr] lg:max-w-[25rem]">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <div className="font-mono text-3xl text-amber-200">80%</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    of ops capacity can disappear into data inconsistencies and manual review work.
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <div className="font-mono text-3xl text-amber-200">50%+</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    of buyers self-educate before they ever want to talk to sales.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6 md:p-7">
            <SectionIntro
              eyebrow="The pain"
              title="The work is precise. The process is brittle."
              body="The report is clear: these teams take pride in rigor, but they are still living inside CRM exports and spreadsheet audits that do not scale. Canary should sound like a sharp ops peer who understands the burden and removes it."
            />
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6 md:p-7">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Conversion frame</div>
            <div className="mt-3 text-sm leading-7 text-muted-foreground">
              Lead with risk avoidance, speed, and ops autonomy. Skip abstract “data quality” language. Show the exact
              downstream mistake Canary prevents.
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6 md:p-7">
            <SectionIntro
              eyebrow="Core personas"
              title="Three buyers. One shared anxiety."
              body="RevOps, SalesOps, and Finance Ops all live with the same risk: a number they can’t fully trust, paired with a manual process they can’t keep running forever."
            />
          </div>
          <div className="grid gap-4">
            {personas.map((persona, index) => (
              <div
                key={persona.title}
                className={cn(
                  "rounded-[1.75rem] border border-white/10 bg-white/5 p-5",
                  index === 0 && "lg:-mr-6",
                  index === 1 && "lg:ml-8",
                )}
              >
                <div className="text-[11px] uppercase tracking-[0.22em] text-amber-200">{persona.role}</div>
                <h3 className="mt-2 text-xl font-semibold">{persona.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{persona.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {persona.stats.map((stat) => (
                    <span
                      key={stat}
                      className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-300"
                    >
                      {stat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/4 p-6 md:p-7">
            <SectionIntro
              eyebrow="What opens budget"
              title="Canary needs to show up at the exact moment manual control breaks."
              body="The strongest buying windows are public errors, scaling pain, executive scrutiny, and new-leader pressure. The homepage should feel like it recognizes that moment immediately."
            />
            <div className="grid gap-3">
              {triggers.map((trigger) => (
                <div key={trigger.title} className="rounded-[1.5rem] border border-white/10 bg-black/10 p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-full border border-amber-300/18 bg-amber-400/10 p-2 text-amber-100">
                      <trigger.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{trigger.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{trigger.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/4 p-6 md:p-7">
            <SectionIntro
              eyebrow="What kills the deal"
              title="Don’t make the buyer ask engineering for permission."
              body="The report calls this out repeatedly: the wrong workflow and the wrong language will stall an otherwise strong buyer."
            />
            <div className="space-y-3">
              {dealKillers.map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-red-400/12 bg-red-500/6 px-4 py-3 text-sm leading-6 text-zinc-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 md:p-8" id="workflow">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionIntro
              eyebrow="Existing product flow"
              title="The landing page now hands people into the pages that already exist."
              body="Instead of stopping at a generic CTA, the homepage points into the actual product journey: setup for rule creation, dashboard for triage, and history for auditability."
            />
            <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
              {workflowCards.map((card, index) => (
                <div
                  key={card.title}
                  className={cn(
                    "rounded-[1.75rem] border border-white/10 bg-white/5 p-5",
                    index === 0 && "md:row-span-2",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-amber-300/18 bg-amber-400/10 p-2 text-amber-100">
                      <card.icon className="h-4 w-4" />
                    </span>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{card.title}</div>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{card.subtitle}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.body}</p>
                  {card.href ? (
                    <Link href={card.href} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-5")}>
                      {card.cta}
                    </Link>
                  ) : (
                    <div className="mt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">{card.cta}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {primaryProject ? (
          <section className="space-y-5">
            <SectionIntro
              eyebrow="Live workspace"
              title="Jump back into the account experience"
              body={`"${primaryProject.name}" is ready to open. The cards below drop straight into the current workspace flow.`}
            />
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <ProjectCard project={primaryProject} />
              <div className="grid gap-4">
                {[
                  { label: "Open dashboard", href: dashboardHref },
                  { label: "Refine setup", href: setupHref },
                  { label: "Review history", href: historyHref },
                ].map((link) =>
                  link.href ? (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5 text-sm transition-colors hover:bg-white/8"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{link.label}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ) : null,
                )}
              </div>
            </div>
          </section>
        ) : null}

        <section className="rounded-[2.25rem] border border-amber-300/16 bg-[linear-gradient(135deg,rgba(251,191,36,0.12),rgba(255,255,255,0.03))] p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-amber-100">Final CTA</div>
              <h2 className="max-w-[15ch] text-3xl font-semibold tracking-tight md:text-4xl">
                Give the team an early warning system before the next bad export lands.
              </h2>
              <p className="max-w-[60ch] text-sm leading-7 text-zinc-200/78 md:text-base">
                The GTM report’s strongest message is simple: the buyer wants protection, proof, and relief. The next
                step in this product is creating a workspace and landing directly in setup.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <CreateProjectDialog triggerLabel="Create your workspace" />
              {primaryProject ? (
                <Link href={setupHref!} className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                  Go to setup
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
