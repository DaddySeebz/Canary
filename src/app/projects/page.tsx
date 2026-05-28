import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Clock3,
  FolderKanban,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { InitialUploadOnboarding } from "@/components/onboarding/initial-upload-onboarding";
import { getProjectsLandingModel, type ProjectsLandingProject } from "@/components/projects/projects-index-utils";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { Badge } from "@/components/ui/badge";
import { requireUserId } from "@/lib/auth";
import { listProjectsWithStats } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

function formatRelativeDate(value: string | null) {
  if (!value) {
    return "No audit yet";
  }

  const timestamp = new Date(value).getTime();
  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(1, Math.round(diffMs / 60000));

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 48) {
    return `${hours} hr ago`;
  }

  const days = Math.round(hours / 24);
  return `${days} days ago`;
}

function getHealthLabel(project: ProjectsLandingProject) {
  const health = project.latest_run_health_score;

  if (health === null) {
    return "Not run";
  }

  if (project.needsAttention) {
    return "Attention";
  }

  return "Healthy";
}

function ProjectLandingCard({ project }: { project: ProjectsLandingProject }) {
  const health = project.latest_run_health_score;
  const healthTone =
    health === null
      ? "text-slate-400"
      : health >= 90
        ? "text-emerald-700"
        : health >= 75
          ? "text-amber-700"
          : "text-red-700";

  return (
    <Link
      href={`/projects/${project.id}/monitoring`}
      className="group grid gap-4 rounded-lg border border-[color:var(--workspace-border)] bg-white px-4 py-4 shadow-[0_1px_0_rgba(15,23,42,0.03)] transition-colors hover:border-amber-300 md:grid-cols-[1.3fr_0.75fr_0.75fr_auto]"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-lg font-semibold tracking-tight text-slate-950">{project.name}</h2>
          <Badge variant={project.needsAttention ? "warning" : health === null ? "default" : "passing"}>
            {getHealthLabel(project)}
          </Badge>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
          {project.description || "Configure files, rules, and monitoring for this project."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm md:block md:space-y-1">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Health</div>
        <div className={`font-mono text-2xl ${healthTone}`}>{health === null ? "--" : health}</div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm md:grid-cols-1 md:gap-1">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Critical</div>
          <div className="mt-1 font-mono text-base text-slate-950">{project.latest_run_critical_count}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Warning</div>
          <div className="mt-1 font-mono text-base text-slate-950">{project.latest_run_warning_count}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Files</div>
          <div className="mt-1 font-mono text-base text-slate-950">{project.file_count}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 text-sm text-slate-500 md:border-l md:border-t-0 md:pl-4 md:pt-0">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <Clock3 className="h-3.5 w-3.5" />
            Last
          </div>
          <div className="mt-1 whitespace-nowrap">{formatRelativeDate(project.latest_run_at)}</div>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-amber-700" />
      </div>
    </Link>
  );
}

export default async function ProjectsIndexPage() {
  const userId = await requireUserId();
  const projects = await listProjectsWithStats(userId);

  if (projects.length === 0) {
    return <InitialUploadOnboarding />;
  }

  const model = getProjectsLandingModel(projects);
  const { metrics } = model;
  const topAttentionProject = model.projects.find((project) => project.needsAttention);
  const healthyProjectCount = model.projects.filter(
    (project) => project.latest_run_health_score !== null && !project.needsAttention,
  ).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <section className="workspace-panel rounded-lg border border-[color:var(--workspace-border)] px-5 py-6 md:px-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-[44rem] space-y-3">
              <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700">Returning workspace</div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Good morning.</h1>
              <p className="text-base leading-8 text-slate-500">
                {metrics.needsAttentionCount > 0
                  ? `${metrics.needsAttentionCount} ${metrics.needsAttentionCount === 1 ? "project needs" : "projects need"} a look.`
                  : "All owned projects are steady right now."}{" "}
                A quick triage at the top, your projects below. Open any project to dig in, or start fresh from a new dataset.
              </p>
            </div>
            <CreateProjectDialog triggerLabel="New project" />
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {[
              {
                label: "Workspace health",
                value: metrics.workspaceHealth === null ? "--" : `${metrics.workspaceHealth}%`,
                detail: metrics.needsAttentionCount > 0 ? `${metrics.needsAttentionCount} need review` : "All clear",
                icon: ShieldCheck,
              },
              {
                label: "Critical",
                value: metrics.criticalProjectCount,
                detail: `in ${metrics.criticalProjectCount === 1 ? "1 project" : `${metrics.criticalProjectCount} projects`}`,
                icon: AlertTriangle,
              },
              {
                label: "Warnings",
                value: metrics.warningFindingCount,
                detail: "latest runs",
                icon: Activity,
              },
              {
                label: "Owned projects",
                value: model.projects.length,
                detail: `${metrics.totalFiles} files · ${metrics.totalRules} rules`,
                icon: FolderKanban,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-[color:var(--workspace-border)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <item.icon className="h-5 w-5 text-amber-600" />
                  <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{item.label}</span>
                </div>
                <div className="mt-5 font-mono text-3xl text-slate-950">{item.value}</div>
                <div className="mt-1 text-sm text-slate-500">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">All owned projects</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Projects</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-800">All</span>
              <span className="rounded-full border border-[color:var(--workspace-border)] bg-white px-3 py-1 text-slate-500">
                Mine
              </span>
              <span className="rounded-full border border-[color:var(--workspace-border)] bg-white px-3 py-1 text-slate-500">
                Needs attention first
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {model.projects.map((project) => (
              <ProjectLandingCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-lg border border-[color:var(--workspace-border)] bg-[#111113] p-5 text-zinc-200 shadow-[0_22px_60px_-36px_rgba(15,15,15,0.5)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Canary AI
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              {model.projects.length} projects
            </div>
          </div>

          <div className="mt-5 rounded border border-white/8 bg-white/[0.035] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-300">Executive briefing</div>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              Workspace health is{" "}
              <span className="font-semibold text-white">{metrics.workspaceHealth === null ? "not scored" : `${metrics.workspaceHealth}%`}</span>
              {metrics.needsAttentionCount > 0
                ? `, with ${metrics.needsAttentionCount} ${metrics.needsAttentionCount === 1 ? "project" : "projects"} needing review`
                : ", with no owned projects currently flagged for review"}
              . Latest runs show{" "}
              <span className="font-semibold text-white">{metrics.totalViolations}</span> flagged rows across the workspace.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {topAttentionProject ? (
              <Link
                href={`/projects/${topAttentionProject.id}/monitoring`}
                className="block rounded border border-red-400/20 bg-red-400/10 p-4 transition-colors hover:border-red-300/40"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-red-300">Triage now</div>
                <div className="mt-2 text-sm font-semibold text-white">{topAttentionProject.name}</div>
                <div className="mt-1 text-sm text-zinc-400">
                  {topAttentionProject.latest_run_critical_count} critical · {topAttentionProject.latest_run_warning_count} warning
                </div>
              </Link>
            ) : (
              <div className="rounded border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300">Steady</div>
                <div className="mt-2 text-sm text-zinc-300">{healthyProjectCount} healthy projects are ready for review.</div>
              </div>
            )}

            <div className="rounded border border-white/8 bg-white/[0.025] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Ask Canary</div>
              <div className="mt-3 space-y-2 text-sm text-zinc-300">
                <div>Which projects need me this week?</div>
                <div>Compare this month to last month&apos;s health</div>
                <div>Summarize latest critical findings</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[color:var(--workspace-border)] bg-white p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <BrainCircuit className="h-4 w-4 text-amber-600" />
            Workspace memory
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-2xl text-slate-950">{healthyProjectCount}</div>
              <div className="mt-1 text-sm text-slate-500">Healthy</div>
            </div>
            <div>
              <div className="font-mono text-2xl text-slate-950">{metrics.totalViolations}</div>
              <div className="mt-1 text-sm text-slate-500">Flagged rows</div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
