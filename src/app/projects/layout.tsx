import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireUserId } from "@/lib/auth";
import { listProjectsWithStats } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await requireUserId();
  const projects = await listProjectsWithStats(userId);

  if (projects.length === 0) {
    return children;
  }

  return <WorkspaceShell>{children}</WorkspaceShell>;
}
