import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProjectsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUserId();

  return <WorkspaceShell>{children}</WorkspaceShell>;
}
