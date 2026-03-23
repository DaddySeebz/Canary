import { NextResponse } from "next/server";

import { getFindingsBundle } from "@/lib/db/runs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("run_id") || undefined;
  const bundle = getFindingsBundle(id, runId);

  if (!bundle) {
    return NextResponse.json({ message: "No audit results yet." });
  }

  return NextResponse.json(bundle);
}
