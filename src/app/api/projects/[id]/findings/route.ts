import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getProjectById } from "@/lib/db/projects";
import { getFindingsBundle } from "@/lib/db/runs";

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
  const runId = searchParams.get("run_id") || undefined;
  const bundle = await getFindingsBundle(id, runId);

  if (!bundle) {
    return NextResponse.json({ message: "No audit results yet." });
  }

  return NextResponse.json(bundle);
}
