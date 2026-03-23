import Link from "next/link";
import { notFound } from "next/navigation";

import { DeploymentBanner } from "@/components/layout/deployment-banner";
import { ProjectNav } from "@/components/layout/project-nav";
import { getProjectById } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

export default async function ProjectLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-[100dvh] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <DeploymentBanner />
        <header className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Canary
            </Link>{" "}
            / <span className="text-foreground">{project.name}</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
            <p className="text-sm text-muted-foreground">
              {project.description || "Upload CSVs, define the checks, and let Canary tell you what breaks first."}
            </p>
          </div>
          <ProjectNav projectId={id} />
        </header>
        {children}
      </div>
    </main>
  );
}
