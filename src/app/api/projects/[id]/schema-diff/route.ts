import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { diffSchema } from "@/lib/csv/schema-diff";
import { getFileById, getPreviousFileVersion } from "@/lib/db/files";
import { getProjectById } from "@/lib/db/projects";
import { listProjectRules } from "@/lib/db/rules";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await getProjectById(id, userId))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("file_id");

  if (!fileId) {
    return NextResponse.json({ error: "file_id is required" }, { status: 400 });
  }

  const currentFile = await getFileById(fileId);
  if (!currentFile || currentFile.project_id !== id) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const [previousFile, rules] = await Promise.all([
    getPreviousFileVersion(id, currentFile.original_name, currentFile.id),
    listProjectRules(id),
  ]);
  const schemaDiff = diffSchema(previousFile, currentFile, rules);

  return NextResponse.json(schemaDiff);
}
