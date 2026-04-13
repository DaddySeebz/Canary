import { Activity, BrainCircuit, FolderKanban, ShieldCheck } from "lucide-react";

import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ProjectCard } from "@/components/projects/project-card";
import { requireUserId } from "@/lib/auth";
import { listProjectsWithStats } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsIndexPage() {
  const userId = await requireUserId();
  const projects = listProjectsWithStats(userId);
  const totals = projects.reduce(
    (acc, project) => {
      acc.files += project.file_count;
      acc.rules += project.rule_count;
      acc.violations += project.latest_run_violations ?? 0;
      return acc;
    },
    { files: 0, rules: 0, violations: 0 },
  );

  return (
    <div className="space-y-6">
      <section className="workspace-panel rounded-[0.9rem] border border-[color:var(--workspace-border)] px-6 py-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-[42rem] space-y-3">
            <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700">Authenticated workspace</div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Operate every audit from one control surface.</h1>
            <p className="text-base leading-8 text-slate-500">
              Manage active audits, monitor live risk, and preserve the operational memory of every data-quality event across your Canary workspaces.
            </p>
          </div>
          <CreateProjectDialog triggerLabel="Create New Audit" />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Workspaces", value: projects.length, icon: FolderKanban },
            { label: "Tracked files", value: totals.files, icon: ShieldCheck },
            { label: "Live rules", value: totals.rules, icon: Activity },
            { label: "Latest flagged rows", value: totals.violations, icon: BrainCircuit },
          ].map((item) => (
            <div key={item.label} className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-white p-4">
              <item.icon className="h-5 w-5 text-amber-600" />
              <div className="mt-5 text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
              <div className="mt-2 font-mono text-3xl text-slate-950">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      {projects.length === 0 ? (
        <section className="workspace-panel rounded-[0.9rem] border border-dashed border-[color:var(--workspace-border)] px-6 py-10">
          <div className="max-w-[36rem] space-y-3">
            <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700">No workspaces yet</div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Create your first audit workspace.</h2>
            <p className="text-sm leading-7 text-slate-500">
              Start with a single CSV, define what should always be true, and let Canary turn that into continuous monitoring logic.
            </p>
          </div>
        </section>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>
      )}
    </div>
  );
}
