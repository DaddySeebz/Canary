import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { generateInsights } from "@/lib/ai/insights-generator";
import { detectPatterns } from "@/lib/analytics/pattern-detector";
import { logActivity } from "@/lib/db/activity";
import { getProjectById } from "@/lib/db/projects";
import {
  listInsightsForRun,
  replaceInsightsForRun,
} from "@/lib/db/insights";
import { getLatestRun, listCompletedRuns } from "@/lib/db/runs";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
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

  const runs = await listCompletedRuns(id, 6);

  if (runs.length < 3) {
    return NextResponse.json({
      insights: [],
      message: "Run at least 3 audits to unlock proactive insights.",
    });
  }

  const latestRun = await getLatestRun(id);
  if (!latestRun) {
    return NextResponse.json({ insights: [] });
  }

  const existing = await listInsightsForRun(id, latestRun.id);
  if (existing.length > 0) {
    return NextResponse.json({ insights: existing });
  }

  const patterns = await detectPatterns(id);
  const insights = await generateInsights(id, patterns);

  await replaceInsightsForRun(id, latestRun.id, insights);
  await logActivity(
    id,
    "insights.generated",
    JSON.stringify({ runId: latestRun.id, count: insights.length }),
  );

  return NextResponse.json({ insights });
}
