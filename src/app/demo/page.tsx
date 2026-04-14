import Link from "next/link";
import { notFound } from "next/navigation";

import { calculateRoiImpact } from "@/lib/analytics/roi";
import { getSigmaMetrics } from "@/lib/analytics/sigma";
import { listActivity } from "@/lib/db/activity";
import { listProjectFiles } from "@/lib/db/files";
import { listProjectInsights } from "@/lib/db/insights";
import { getPublicProjectById } from "@/lib/db/projects";
import { getROISettings } from "@/lib/db/roi";
import { getFindingsBundle, listCompletedRuns } from "@/lib/db/runs";
import { listProjectRules } from "@/lib/db/rules";
import { ensurePublicDemoProjectSeeded, PUBLIC_DEMO_PROJECT_ID } from "@/lib/demo/vercel-seed";
import { isPublicDemoEnabled, isVercelPreviewDeployment } from "@/lib/env";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { ROICard } from "@/components/analytics/roi-card";
import { SigmaScore } from "@/components/analytics/sigma-score";
import { HealthScore } from "@/components/audit/health-score";
import { IssueTriage } from "@/components/audit/issue-triage";
import { CanaryLogo } from "@/components/branding/canary-logo";
import { FileList } from "@/components/files/file-list";
import { InsightsPanel } from "@/components/insights/insights-panel";
import { DeploymentBanner } from "@/components/layout/deployment-banner";
import { RuleList } from "@/components/rules/rule-list";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DemoPage() {
  if (!isPublicDemoEnabled()) {
    notFound();
  }

  await ensurePublicDemoProjectSeeded();
  const project = await getPublicProjectById(PUBLIC_DEMO_PROJECT_ID);

  if (!project) {
    notFound();
  }

  const [files, rules, bundle, roiSettings, insights, activity, completedRuns] = await Promise.all([
    listProjectFiles(project.id),
    listProjectRules(project.id),
    getFindingsBundle(project.id),
    getROISettings(project.id),
    listProjectInsights(project.id),
    listActivity(project.id),
    listCompletedRuns(project.id, 6),
  ]);

  const resolvedRoiSettings =
    roiSettings || {
      cost_per_error: 0,
      time_per_fix_minutes: 0,
      hourly_rate: 0,
      volume_per_period: 0,
    };

  const activeRules = rules.filter((rule) => rule.active);
  const summary = bundle?.summary ?? [];
  const criticalCount = summary.filter((item) => item.finding_count > 0 && item.severity === "critical").length;
  const warningCount = summary.filter((item) => item.finding_count > 0 && item.severity === "warning").length;
  const passingCount = summary.filter((item) => item.finding_count === 0).length;
  const sigma = getSigmaMetrics(
    bundle?.run.total_violations ?? 0,
    bundle?.run.total_rows_checked ?? 0,
    Math.max(activeRules.length, 1),
  );
  const roiImpact = calculateRoiImpact(
    bundle?.run.total_violations ?? 0,
    bundle?.run.total_rows_checked ?? 0,
    {
      costPerError: resolvedRoiSettings.cost_per_error,
      avgFixMinutes: resolvedRoiSettings.time_per_fix_minutes,
      hourlyRate: resolvedRoiSettings.hourly_rate,
      volumePerPeriod: resolvedRoiSettings.volume_per_period,
    },
  );

  return (
    <main className="min-h-[100dvh] bg-[color:var(--workspace-bg)] px-4 py-5 text-[color:var(--workspace-ink)] md:px-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <header className="glass-panel rounded-[0.75rem] border border-white/10 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <CanaryLogo variant="inline" showTagline={false} />
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
                Back Home
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
                Create Your Workspace
              </Link>
            </div>
          </div>
        </header>

        <DeploymentBanner preview={isVercelPreviewDeployment()} />

        <section className="glass-panel rounded-[0.9rem] border border-white/10 px-8 py-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-[0.26em] text-amber-200/90">Public demo</div>
              <h1 className="max-w-[14ch] text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {project.name}
              </h1>
              <p className="max-w-[58ch] text-sm leading-7 text-zinc-300">
                {project.description}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[0.75rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Files</div>
                <div className="mt-3 font-mono text-3xl text-white">{files.length}</div>
              </div>
              <div className="rounded-[0.75rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Active rules</div>
                <div className="mt-3 font-mono text-3xl text-white">{activeRules.length}</div>
              </div>
              <div className="rounded-[0.75rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Completed runs</div>
                <div className="mt-3 font-mono text-3xl text-white">{completedRuns.length}</div>
              </div>
            </div>
          </div>
        </section>

        {bundle?.run ? (
          <>
            <HealthScore
              score={bundle.run.health_score ?? 0}
              criticalCount={criticalCount}
              warningCount={warningCount}
              passingCount={passingCount}
            />
            <IssueTriage
              summary={bundle.summary}
              findings={bundle.findings}
              resolutions={bundle.resolutions}
            />
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <SigmaScore
                sigma={sigma.sigma}
                dpmo={sigma.dpmo}
                yieldValue={sigma.yield}
                label={sigma.label}
              />
              <ROICard
                projectId={project.id}
                impact={roiImpact}
                inputs={resolvedRoiSettings}
                readOnly
              />
            </div>
          </>
        ) : null}

        <InsightsPanel insights={insights} />

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="workspace-panel rounded-[0.9rem] border border-[color:var(--workspace-border)] p-6">
            <div className="mb-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700">Data context</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Seeded files</h2>
            </div>
            <FileList files={files} />
          </div>
          <div className="workspace-panel rounded-[0.9rem] border border-[color:var(--workspace-border)] p-6">
            <div className="mb-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700">Rule pack</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Active guardrails</h2>
            </div>
            <RuleList projectId={project.id} rules={rules} readOnly />
          </div>
        </section>

        <section className="workspace-panel rounded-[0.9rem] border border-[color:var(--workspace-border)] p-6">
          <div className="mb-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700">Operational timeline</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Recent demo activity</h2>
          </div>
          <ActivityTimeline entries={activity} />
        </section>
      </div>
    </main>
  );
}
