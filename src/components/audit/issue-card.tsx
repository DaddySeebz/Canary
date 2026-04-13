"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FindingRecord, ResolutionRecord } from "@/lib/db/types";

export interface IssueSummary {
  rule_id: string;
  description_plain: string;
  rule_type: string;
  severity: "critical" | "warning" | "passing";
  active: boolean;
  finding_count: number;
  file_count: number;
}

export function IssueCard({
  issue,
  findings,
  resolution,
}: {
  issue: IssueSummary;
  findings: FindingRecord[];
  resolution?: ResolutionRecord;
}) {
  const [expanded, setExpanded] = useState(false);
  const preview = findings.slice(0, 50);
  const fileCount = useMemo(() => new Set(findings.map((finding) => finding.file_id)).size, [findings]);

  function exportCsv() {
    const header = ["row_number", "column_name", "value", "expected", "message"].join(",");
    const rows = findings.map((finding) =>
      [
        finding.row_number,
        JSON.stringify(finding.column_name ?? ""),
        JSON.stringify(finding.value ?? ""),
        JSON.stringify(finding.expected ?? ""),
        JSON.stringify(finding.message),
      ].join(","),
    );

    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${issue.rule_type}-${issue.rule_id}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="border-[color:var(--workspace-border)] bg-white">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={issue.severity}>{issue.severity}</Badge>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {issue.rule_type.replaceAll("_", " ")}
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-950">{issue.description_plain}</div>
            <div className="font-mono text-xs text-slate-500">
              {issue.finding_count} rows affected • {fileCount || issue.file_count} files
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setExpanded((value) => !value)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {expanded ? "Hide Findings" : "Show Findings"}
            </Button>
            <Button variant="secondary" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4 text-sm text-slate-600">
          <span className="font-medium text-slate-950">Resolution:</span>{" "}
          {resolution?.suggestion || "Review the flagged rows and correct the source values before the next run."}
        </div>
        {expanded ? (
          <div className="overflow-hidden rounded-[0.75rem] border border-[color:var(--workspace-border)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Column</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell className="font-mono text-xs">{finding.row_number}</TableCell>
                    <TableCell className="font-mono text-xs">{finding.column_name || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{finding.value || "—"}</TableCell>
                    <TableCell>{finding.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
