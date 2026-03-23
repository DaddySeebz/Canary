import { generateObject } from "ai";
import { z } from "zod";

import { getModel } from "@/lib/ai/provider";
import type { DetectedPattern } from "@/lib/analytics/pattern-detector";
import { listCompletedRuns } from "@/lib/db/runs";

const insightsSchema = z.object({
  insights: z.array(
    z.object({
      insight_type: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      evidence: z.string().min(1),
      recommendation: z.string().min(1),
      severity: z.enum(["info", "warning", "critical"]),
      status: z.literal("new").default("new"),
    }),
  ),
});

function buildFallback(patterns: DetectedPattern[]) {
  return patterns.map((pattern) => ({
    insight_type: pattern.type,
    title: pattern.title,
    description: `Canary spotted a ${pattern.type.replace(/_/g, " ")} pattern that deserves a closer look.`,
    evidence: pattern.evidence,
    recommendation: "Check the source process that feeds this field and tighten the export checklist.",
    severity:
      pattern.severity === "critical"
        ? "critical"
        : pattern.severity === "warning"
          ? "warning"
          : "info",
    status: "new" as const,
  }));
}

export async function generateInsights(projectId: string, patterns: DetectedPattern[]) {
  if (patterns.length === 0) {
    return [];
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return buildFallback(patterns);
  }

  try {
    const runs = listCompletedRuns(projectId, 6);
    const prompt = [
      "You are Canary's root-cause analyst.",
      "Turn the detected data quality patterns into concise, evidence-backed insights.",
      "Stay practical. No hype. No generic management language.",
      "",
      `Recent runs: ${JSON.stringify(runs, null, 2)}`,
      `Patterns: ${JSON.stringify(patterns, null, 2)}`,
    ].join("\n");

    const result = await generateObject({
      model: getModel(),
      schema: insightsSchema,
      prompt,
    });

    return result.object.insights;
  } catch {
    return buildFallback(patterns);
  }
}
