"use client";

import { useState } from "react";

import { FileList } from "@/components/files/file-list";
import { FileUploader } from "@/components/files/file-uploader";
import { SchemaChangeBanner } from "@/components/files/schema-change-banner";
import { RuleChat } from "@/components/rules/rule-chat";
import { RuleList } from "@/components/rules/rule-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditRuleRecord, FileRecord, SchemaDiffResult } from "@/lib/db/types";

export function SetupClient({
  projectId,
  files,
  rules,
}: {
  projectId: string;
  files: FileRecord[];
  rules: AuditRuleRecord[];
}) {
  const [fileState, setFileState] = useState(files);
  const [schemaDiff, setSchemaDiff] = useState<SchemaDiffResult | null>(null);
  const activeRules = rules.filter((rule) => rule.active).length;

  return (
    <div className="space-y-6">
      <SchemaChangeBanner schemaDiff={schemaDiff} />
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-3 border-b border-[color:var(--workspace-border)] bg-[linear-gradient(180deg,#ffffff,#faf8f2)]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-amber-700">Configuration</div>
              <CardTitle className="text-3xl">Project setup</CardTitle>
              <p className="max-w-[54ch] text-sm leading-7 text-[color:var(--workspace-muted)]">
                Upload your data source, let Canary map the schema, then describe the monitoring logic you want enforced.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <FileUploader
                projectId={projectId}
                onUploaded={(payload) => {
                  setSchemaDiff(payload.schemaDiff as SchemaDiffResult);
                  setFileState((current) => [payload.file as FileRecord, ...current]);
                }}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-5">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Estimated processing</div>
                  <div className="mt-4 font-mono text-4xl text-slate-950">
                    {Math.max(0.24, Number((fileState.length * 0.18 + Math.max(activeRules, 1) * 0.08).toFixed(2)))}s
                  </div>
                  <p className="mt-3 text-sm text-slate-500">Projected based on current file count and the active rule pack.</p>
                </div>
                <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-5">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Mapped readiness</div>
                  <div className="mt-4 font-mono text-4xl text-slate-950">
                    {fileState.length > 0 ? Math.min(99, 64 + fileState.length * 9 + activeRules * 4) : 0}%
                  </div>
                  <p className="mt-3 text-sm text-slate-500">Schema coverage rises as files and rules give Canary better operating context.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detected schema and context</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Files</div>
                <FileList files={fileState} />
              </div>
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Rules</div>
                <RuleList projectId={projectId} rules={rules} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="min-h-[640px]">
            <CardHeader className="border-b border-[color:var(--workspace-border)]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-amber-700">Rule architect</div>
              <CardTitle className="text-2xl">Canary assistant</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-6rem)] pt-6">
              <RuleChat projectId={projectId} />
            </CardContent>
          </Card>
          <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-[#fff7e7] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-amber-700">Operator note</div>
            <p className="mt-3 text-sm leading-7 text-[#8a5a0a]">
              Describe validation logic the way you would explain it to a new analyst. Canary translates that instruction into an auditable rule and keeps the schema context attached.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
