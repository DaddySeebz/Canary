import { requireOwnedProject } from "@/lib/auth";
import { listProjectFiles } from "@/lib/db/files";
import { listProjectRules } from "@/lib/db/rules";
import { isAiConfigured } from "@/lib/env";

import { SetupClient } from "../setup-client";

export const dynamic = "force-dynamic";

export default async function ProjectAuditsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireOwnedProject(id);

  const [files, rules] = await Promise.all([
    listProjectFiles(id),
    listProjectRules(id),
  ]);

  return <SetupClient projectId={id} files={files} rules={rules} aiEnabled={isAiConfigured()} />;
}
