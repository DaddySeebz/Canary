import { listProjectFiles } from "@/lib/db/files";
import { listProjectRules } from "@/lib/db/rules";

import { SetupClient } from "../setup-client";

export const dynamic = "force-dynamic";

export default async function ProjectSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SetupClient projectId={id} files={listProjectFiles(id)} rules={listProjectRules(id)} />;
}
