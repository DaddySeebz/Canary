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
          <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
            Run at least three audits and Canary will start surfacing patterns, drift, and likely root causes.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[linear-gradient(180deg,oklch(0.2_0.01_75),oklch(0.17_0.015_75))]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-200" />
          Proactive Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {insights.map((insight) => (
          <div key={insight.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              {insight.insight_type.replaceAll("_", " ")}
            </div>
            <div className="mt-3 text-base font-semibold">{insight.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{insight.description}</p>
            {insight.evidence ? (
              <p className="mt-3 rounded-[1rem] border border-white/10 bg-white/5 p-3 text-sm text-foreground/90">
                {insight.evidence}
              </p>
            ) : null}
            {insight.recommendation ? (
              <p className="mt-3 text-sm text-amber-100/90">{insight.recommendation}</p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
