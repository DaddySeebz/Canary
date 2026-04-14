import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getProjectById } from "@/lib/db/projects";
import { runAudit } from "@/lib/rules/engine";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _request: Request,
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

  try {
    const result = await runAudit(id);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Audit failed" },
      { status: 400 },
    );
  }
}
