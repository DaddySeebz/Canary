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

  return (
    <div className="space-y-6">
      <SchemaChangeBanner schemaDiff={schemaDiff} />
      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.95fr]">
        <Card className="min-h-[680px]">
          <CardHeader>
            <CardTitle>AI Rule Chat</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)]">
            <RuleChat projectId={projectId} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Context Sidebar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Files</div>
                <FileList files={fileState} />
              </div>
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rules</div>
                <RuleList projectId={projectId} rules={rules} />
              </div>
            </CardContent>
          </Card>

          <FileUploader
            projectId={projectId}
            onUploaded={(payload) => {
              setSchemaDiff(payload.schemaDiff as SchemaDiffResult);
              setFileState((current) => [payload.file as FileRecord, ...current]);
            }}
          />
        </div>
      </div>
    </div>
  );
}
