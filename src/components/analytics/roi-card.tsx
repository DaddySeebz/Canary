import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROIInputsDialog } from "@/components/analytics/roi-inputs-dialog";

export function ROICard({
  projectId,
  impact,
  inputs,
}: {
  projectId: string;
  impact: {
    totalRisk: number;
    projectedSavings: number;
    annualizedSavings: number;
    timeSavedPerAudit: number;
  };
  inputs: {
    cost_per_error: number;
    time_per_fix_minutes: number;
    hourly_rate: number;
    volume_per_period: number;
  };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>ROI Impact</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Conservative estimates only. Canary assumes a 70% fix rate and floors every number.
          </p>
        </div>
        <ROIInputsDialog projectId={projectId} initialValues={inputs} />
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total risk</div>
          <div className="mt-2 font-mono text-3xl">${impact.totalRisk.toLocaleString()}</div>
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Projected savings</div>
          <div className="mt-2 font-mono text-3xl">${impact.projectedSavings.toLocaleString()}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            ${impact.annualizedSavings.toLocaleString()} annualized
          </div>
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 md:col-span-2">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Time saved per audit</div>
          <div className="mt-2 font-mono text-3xl">{impact.timeSavedPerAudit.toLocaleString()} hrs</div>
        </div>
      </CardContent>
    </Card>
  );
}
