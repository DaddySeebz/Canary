import { BrainCircuit, Clock3, Sparkles } from "lucide-react";

import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { ROICard } from "@/components/analytics/roi-card";
import { SigmaScore } from "@/components/analytics/sigma-score";
import { InsightsPanel } from "@/components/insights/insights-panel";
import { requireOwnedProject } from "@/lib/auth";
import { calculateRoiImpact } from "@/lib/analytics/roi";
import { getSigmaMetrics } from "@/lib/analytics/sigma";
import { listActivity } from "@/lib/db/activity";
import { listProjectInsights } from "@/lib/db/insights";
import { getROISettings } from "@/lib/db/roi";
import { getFindingsBundle, listCompletedRuns } from "@/lib/db/runs";
import { listProjectRules } from "@/lib/db/rules";

export const dynamic = "force-dynamic";

export default async function ProjectIntelligencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireOwnedProject(id);

  const [bundle, rules, roiSettings, insights, activity, completedRuns] = await Promise.all([
    getFindingsBundle(id),
    listProjectRules(id),
    getROISettings(id),
    listProjectInsights(id),
    listActivity(id),
    listCompletedRuns(id, 6),
  ]);
  const resolvedRoiSettings =
    roiSettings || {
      cost_per_error: 0,
      time_per_fix_minutes: 0,
      hourly_rate: 0,
      volume_per_period: 0,
    };

  const sigma = getSigmaMetrics(
    bundle?.run.total_violations ?? 0,
    bundle?.run.total_rows_checked ?? 0,
    Math.max(rules.filter((rule) => rule.active).length, 1),
  );

  const roiImpact = calculateRoiImpact(bundle?.run.total_violations ?? 0, bundle?.run.total_rows_checked ?? 0, {
    costPerError: resolvedRoiSettings.cost_per_error,
    avgFixMinutes: resolvedRoiSettings.time_per_fix_minutes,
    hourlyRate: resolvedRoiSettings.hourly_rate,
    volumePerPeriod: resolvedRoiSettings.volume_per_period,
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <InsightsPanel insights={insights} />
        <div className="workspace-panel rounded-[0.9rem] border border-[color:var(--workspace-border)] p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[0.75rem] bg-amber-50 text-amber-600">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold text-slate-950">Context sidecar</div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Intelligence summary</div>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-500">
            <p>Canary keeps strategic memory close to the operator: recent findings, repeated drift, and the operational cost of ignoring the same signal twice.</p>
            <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-white p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                Completed runs
              </div>
              <div className="mt-3 font-mono text-3xl text-slate-950">{completedRuns.length}</div>
            </div>
            <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-[#fff7e7] p-4 text-[#8a5a0a]">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
                <Sparkles className="h-3.5 w-3.5" />
                Signal quality
              </div>
              <p className="mt-3 text-sm leading-6">
                {completedRuns.length >= 3
                  ? "Enough runs exist to start treating Canary like an operating memory, not just a one-off auditor."
                  : "Run more audits to unlock stronger pattern detection and historical intelligence."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SigmaScore sigma={sigma.sigma} dpmo={sigma.dpmo} yieldValue={sigma.yield} label={sigma.label} />
        <ROICard projectId={id} impact={roiImpact} inputs={resolvedRoiSettings} />
      </section>

      <section className="workspace-panel rounded-[0.9rem] border border-[color:var(--workspace-border)] p-6">
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700">Operational timeline</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Recent intelligence events</h2>
        </div>
        <ActivityTimeline entries={activity} />
      </section>
    </div>
  );
}
