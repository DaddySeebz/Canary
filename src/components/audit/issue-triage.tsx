import { CheckCircle2, ShieldAlert, TriangleAlert } from "lucide-react";

import { IssueCard, type IssueSummary } from "@/components/audit/issue-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FindingRecord, ResolutionRecord } from "@/lib/db/types";

function Column({
  title,
  icon,
  issues,
  findings,
  resolutions,
}: {
  title: string;
  icon: React.ReactNode;
  issues: IssueSummary[];
  findings: FindingRecord[];
  resolutions: ResolutionRecord[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title} ({issues.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.length === 0 ? (
          <div className="rounded-[0.75rem] border border-dashed border-[color:var(--workspace-border)] bg-slate-50 p-4 text-sm text-slate-500">
            Nothing here.
          </div>
        ) : null}
        {issues.map((issue) => (
          <IssueCard
            key={issue.rule_id}
            issue={issue}
            findings={findings.filter((finding) => finding.rule_id === issue.rule_id)}
            resolution={resolutions.find((resolution) => resolution.rule_id === issue.rule_id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function IssueTriage({
  summary,
  findings,
  resolutions,
}: {
  summary: IssueSummary[];
  findings: FindingRecord[];
  resolutions: ResolutionRecord[];
}) {
  const critical = summary.filter((issue) => issue.finding_count > 0 && issue.severity === "critical");
  const warnings = summary.filter((issue) => issue.finding_count > 0 && issue.severity === "warning");
  const passing = summary.filter((issue) => issue.finding_count === 0 || issue.severity === "passing");

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr_0.85fr]">
      <Column
        title="Critical"
        icon={<ShieldAlert className="h-4 w-4 text-red-500" />}
        issues={critical}
        findings={findings}
        resolutions={resolutions}
      />
      <Column
        title="Warnings"
        icon={<TriangleAlert className="h-4 w-4 text-amber-500" />}
        issues={warnings}
        findings={findings}
        resolutions={resolutions}
      />
      <Column
        title="Passing"
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        issues={passing}
        findings={findings}
        resolutions={resolutions}
      />
    </div>
  );
}
