import { calculateRoiImpact } from "@/lib/analytics/roi";
import { getSigmaMetrics } from "@/lib/analytics/sigma";
import { listProjectFiles } from "@/lib/db/files";
import { listProjectInsights } from "@/lib/db/insights";
import { getROISettings } from "@/lib/db/roi";
import { getFindingsBundle, listCompletedRuns } from "@/lib/db/runs";
import { listProjectRules } from "@/lib/db/rules";

import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const files = listProjectFiles(id);
  const rules = listProjectRules(id);
  const bundle = getFindingsBundle(id);
  const roiSettings =
    getROISettings(id) || {
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
    costPerError: roiSettings.cost_per_error,
    avgFixMinutes: roiSettings.time_per_fix_minutes,
    hourlyRate: roiSettings.hourly_rate,
    volumePerPeriod: roiSettings.volume_per_period,
  });

  return (
    <DashboardClient
      projectId={id}
      files={files}
      rules={rules}
      run={bundle?.run ?? null}
      findings={bundle?.findings ?? []}
      resolutions={bundle?.resolutions ?? []}
      summary={bundle?.summary ?? []}
      sigma={sigma}
      roiImpact={roiImpact}
      roiInputs={roiSettings}
      insights={listProjectInsights(id)}
      canUnlockInsights={listCompletedRuns(id, 6).length >= 3}
    />
  );
}
