import Link from "next/link";

import { ProjectNav } from "@/components/layout/project-nav";
import { requireOwnedProject } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProjectLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const { project } = await requireOwnedProject(id);

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="text-sm text-slate-500">
          <Link href="/projects" className="hover:text-slate-950">
            All projects
          </Link>{" "}
          / <span className="text-slate-900">{project.name}</span>
        </div>
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700">Project workspace</div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{project.name}</h1>
          <p className="max-w-[65ch] text-base leading-8 text-slate-500">
            {project.description || "Configure your data source, define the monitoring logic, and keep downstream reporting trustworthy."}
          </p>
        </div>
        <ProjectNav projectId={id} />
      </header>
      {children}
    </div>
  );
}
