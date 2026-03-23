import { ArrowRight, ChartColumnBig, ShieldAlert, Sparkles } from "lucide-react";

import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { listProjectsWithStats } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const projects = listProjectsWithStats();

  return (
    <main className="min-h-[100dvh] px-4 py-8 md:px-8">
      <div className="surface-grid mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,oklch(0.18_0.01_75),oklch(0.14_0.006_75))] p-8 md:p-10">
          <div className="max-w-[42rem] space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-amber-100">
              Canary
              <ArrowRight className="h-3.5 w-3.5" />
              Know before it costs you
            </div>
            <div className="space-y-4">
              <h1 className="max-w-[14ch] text-4xl font-semibold tracking-tight md:text-6xl">
                Data quality intelligence for teams still living in CSVs.
              </h1>
              <p className="max-w-[60ch] text-base leading-relaxed text-muted-foreground">
                Upload the export, describe the checks in plain English, and get an action-oriented audit instead of another spreadsheet to stare at.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <CreateProjectDialog />
              <Button variant="ghost" size="lg">
                Local-only
              </Button>
            </div>
          </div>
        </section>
        <section className="grid gap-4">
          {[
            {
              icon: ShieldAlert,
              title: "Action-oriented dashboard",
              body: "Severity comes first. Canary tells you what broke, how many rows are affected, and what to fix next.",
            },
            {
              icon: Sparkles,
              title: "Plain English rules",
              body: "Tell Canary what should be true. It turns that into actual audit logic grounded in your uploaded columns.",
            },
            {
              icon: ChartColumnBig,
              title: "Conservative ROI",
              body: "No inflated savings math. Canary floors the estimates so you can defend them in a real ops review.",
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
              <feature.icon className="h-5 w-5 text-amber-200" />
              <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </section>
      </div>

      <div className="mx-auto mt-12 max-w-[1400px]">
        {projects.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/4 p-10">
            <div className="max-w-[32rem] space-y-4">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">First run</div>
              <h2 className="text-3xl font-semibold tracking-tight">Start with a project, then give Canary the CSVs that keep biting you.</h2>
              <p className="text-sm text-muted-foreground">
                It is not a BI tool and it is not an ETL pipeline. It is the early warning system between a spreadsheet export and a downstream mistake.
              </p>
              <CreateProjectDialog triggerLabel="Create your first project" />
            </div>
          </div>
        ) : (
          <section className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Projects</div>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Your audit workspaces</h2>
              </div>
              <CreateProjectDialog triggerLabel="New Project" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
