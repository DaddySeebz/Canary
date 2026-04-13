import Link from "next/link";
import { ArrowRight, Clock3, FolderKanban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectSummary } from "@/lib/db/types";

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link href={`/projects/${project.id}/monitoring`} className="group block">
      <Card className="h-full border-[color:var(--workspace-border)] transition-transform duration-200 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[0.75rem] bg-amber-50 text-amber-600">
                <FolderKanban className="h-5 w-5" />
              </span>
              <div>
                <CardTitle>{project.name}</CardTitle>
                <p className="mt-1 text-sm text-[color:var(--workspace-muted)]">
                  {project.description || "No project description yet."}
                </p>
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Files</div>
              <div className="mt-2 font-mono text-2xl text-slate-950">{project.file_count}</div>
            </div>
            <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Rules</div>
              <div className="mt-2 font-mono text-2xl text-slate-950">{project.rule_count}</div>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              <Clock3 className="h-3.5 w-3.5" />
              Latest run
            </div>
            {project.latest_run_at ? (
              <div className="space-y-2">
                <div className="text-sm text-slate-950">
                  {new Date(project.latest_run_at).toLocaleString()}
                </div>
                <Badge
                  variant={
                    (project.latest_run_health_score ?? 0) >= 90
                      ? "passing"
                      : (project.latest_run_health_score ?? 0) >= 70
                        ? "warning"
                        : "critical"
                  }
                >
                  Health {project.latest_run_health_score ?? "--"}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No audits yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
