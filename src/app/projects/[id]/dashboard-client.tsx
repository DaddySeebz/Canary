"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Play } from "lucide-react";
import { useRouter } from "next/navigation";

import { ROICard } from "@/components/analytics/roi-card";
import { SigmaScore } from "@/components/analytics/sigma-score";
import { HealthScore } from "@/components/audit/health-score";
import { IssueTriage } from "@/components/audit/issue-triage";
import { FileUploader } from "@/components/files/file-uploader";
import { InsightsPanel } from "@/components/insights/insights-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import type { AuditRuleRecord, FileRecord, FindingRecord, InsightRecord, ResolutionRecord } from "@/lib/db/types";

type SummaryItem = {
  rule_id: string;
  description_plain: string;
  rule_type: string;
  severity: "critical" | "warning" | "passing";
  active: boolean;
  finding_count: number;
  file_count: number;
};

export function DashboardClient({
  projectId,
  files,
  rules,
  run,
  findings,
  resolutions,
  summary,
  sigma,
  roiImpact,
  roiInputs,
  insights: initialInsights,
  canUnlockInsights,
}: {
  projectId: string;
  files: FileRecord[];
  rules: AuditRuleRecord[];
  run: {
    ran_at: string;
    duration_ms: number | null;
    health_score: number | null;
    total_violations: number;
    total_rows_checked: number;
  } | null;
  findings: FindingRecord[];
  resolutions: ResolutionRecord[];
  summary: SummaryItem[];
  sigma: { sigma: number; dpmo: number; yield: number; label: string };
  roiImpact: {
    totalRisk: number;
    projectedSavings: number;
    annualizedSavings: number;
    timeSavedPerAudit: number;
  };
  roiInputs: {
    cost_per_error: number;
    time_per_fix_minutes: number;
    hourly_rate: number;
    volume_per_period: number;
  };
  insights: InsightRecord[];
  canUnlockInsights: boolean;
}) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [insights, setInsights] = useState(initialInsights);

  const activeRules = useMemo(() => rules.filter((rule) => rule.active), [rules]);
  const criticalCount = summary.filter((item) => item.finding_count > 0 && item.severity === "critical").length;
  const warningCount = summary.filter((item) => item.finding_count > 0 && item.severity === "warning").length;
  const passingCount = summary.filter((item) => item.finding_count === 0).length;
  const canRunAudit = files.length > 0 && activeRules.length > 0;

  useEffect(() => {
    async function loadInsights() {
      if (!canUnlockInsights || insights.length > 0) {
        return;
      }

      const response = await fetch(`/api/projects/${projectId}/insights`);
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { insights?: InsightRecord[] };
      setInsights(payload.insights || []);
    }

    void loadInsights();
  }, [canUnlockInsights, insights.length, projectId]);

  async function handleRunAudit() {
    setIsRunning(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/audit`, { method: "POST" });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Audit failed.");
      }

      toast.success("Audit complete.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Audit failed.");
    } finally {
      setIsRunning(false);
    }
  }

  if (!run) {
    return (
      <div className="space-y-6">
        <section className="workspace-panel rounded-[0.9rem] border border-[color:var(--workspace-border)] px-6 py-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-[38rem] space-y-3">
              <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700">Monitoring</div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Nothing has been monitored yet.</h2>
              <p className="text-sm leading-7 text-slate-500">
                Upload at least one CSV, define an active rule in audits, and then run the first Canary audit to light up monitoring.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <FileUploader projectId={projectId} compact onUploaded={() => router.refresh()} />
              <Button disabled>
                <Play className="h-4 w-4" />
                Run Audit
              </Button>
            </div>
          </div>
        </section>
        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring will appear here</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4 text-sm text-slate-500">Health score and issue balance</div>
              <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4 text-sm text-slate-500">Active anomaly triage</div>
              <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4 text-sm text-slate-500">Sigma and yield metrics</div>
              <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4 text-sm text-slate-500">ROI and downstream risk</div>
            </CardContent>
          </Card>
          <InsightsPanel insights={[]} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="workspace-panel rounded-[0.9rem] border border-[color:var(--workspace-border)] px-6 py-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Clock3 className="h-4 w-4" />
              Last run: {new Date(run.ran_at).toLocaleString()} {run.duration_ms ? `| ${run.duration_ms}ms` : ""}
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Live monitoring and anomaly triage</h2>
            <p className="max-w-[52ch] text-sm leading-7 text-slate-500">
              Review what broke, what needs watching, and what is safe to move downstream before the number reaches leadership.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FileUploader projectId={projectId} compact onUploaded={() => router.refresh()} />
            <Button onClick={() => void handleRunAudit()} disabled={!canRunAudit || isRunning}>
              <Play className="h-4 w-4" />
              {isRunning ? "Running..." : "Run Audit"}
            </Button>
          </div>
        </div>
      </section>

      <HealthScore
        score={run.health_score ?? 0}
        criticalCount={criticalCount}
        warningCount={warningCount}
        passingCount={passingCount}
      />
      <IssueTriage summary={summary} findings={findings} resolutions={resolutions} />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SigmaScore sigma={sigma.sigma} dpmo={sigma.dpmo} yieldValue={sigma.yield} label={sigma.label} />
        <ROICard projectId={projectId} impact={roiImpact} inputs={roiInputs} />
      </div>

      <InsightsPanel insights={insights} />
    </div>
  );
}
