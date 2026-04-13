import { Lightbulb, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InsightRecord } from "@/lib/db/types";

export function InsightsPanel({ insights }: { insights: InsightRecord[] }) {
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proactive Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-[0.75rem] border border-dashed border-[color:var(--workspace-border)] bg-slate-50 p-4 text-sm text-slate-500">
            Run at least three audits and Canary will start surfacing patterns, drift, and likely root causes.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[linear-gradient(180deg,#ffffff,#faf9f5)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          Proactive Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {insights.map((insight) => (
          <div key={insight.id} className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              <TrendingUp className="h-3.5 w-3.5" />
              {insight.insight_type.replaceAll("_", " ")}
            </div>
            <div className="mt-3 text-base font-semibold text-slate-950">{insight.title}</div>
            <p className="mt-2 text-sm text-slate-500">{insight.description}</p>
            {insight.evidence ? (
              <p className="mt-3 rounded-[0.65rem] border border-[color:var(--workspace-border)] bg-white p-3 text-sm text-slate-700">
                {insight.evidence}
              </p>
            ) : null}
            {insight.recommendation ? (
              <p className="mt-3 text-sm text-amber-700">{insight.recommendation}</p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
