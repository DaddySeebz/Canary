import { NextResponse } from "next/server";

import { generateInsights } from "@/lib/ai/insights-generator";
import { detectPatterns } from "@/lib/analytics/pattern-detector";
import { logActivity } from "@/lib/db/activity";
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
  const runs = listCompletedRuns(id, 6);

  if (runs.length < 3) {
    return NextResponse.json({
      insights: [],
      message: "Run at least 3 audits to unlock proactive insights.",
    });
  }

  const latestRun = getLatestRun(id);
  if (!latestRun) {
    return NextResponse.json({ insights: [] });
  }

  const existing = listInsightsForRun(id, latestRun.id);
  if (existing.length > 0) {
    return NextResponse.json({ insights: existing });
  }

  const patterns = detectPatterns(id);
  const insights = await generateInsights(id, patterns);

  replaceInsightsForRun(id, latestRun.id, insights);
  logActivity(id, "insights.generated", JSON.stringify({ runId: latestRun.id, count: insights.length }));

  return NextResponse.json({ insights });
}
