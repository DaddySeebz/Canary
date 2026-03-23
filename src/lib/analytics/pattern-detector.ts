import { getRunRuleCounts, listCompletedRuns } from "@/lib/db/runs";
import { listProjectRules } from "@/lib/db/rules";

export interface DetectedPattern {
  type: "recurring_issue" | "worsening_trend" | "new_issue";
  ruleId: string;
  title: string;
  evidence: string;
  severity: "critical" | "warning" | "info";
}

export function detectPatterns(projectId: string): DetectedPattern[] {
  const runs = listCompletedRuns(projectId, 6);
  if (runs.length < 3) {
    return [];
  }

  const rules = new Map(listProjectRules(projectId).map((rule) => [rule.id, rule]));
  const byRule = new Map<string, number[]>();

  for (const row of getRunRuleCounts(projectId)) {
    if (!row.rule_id) {
      continue;
    }

    const counts = byRule.get(row.rule_id) || [];
    counts.push(row.violation_count);
    byRule.set(row.rule_id, counts);
  }

  const patterns: DetectedPattern[] = [];

  for (const [ruleId, counts] of byRule.entries()) {
    const rule = rules.get(ruleId);
    if (!rule) {
      continue;
    }

    const recent = counts.slice(-3);
    if (recent.length === 3 && recent.every((count) => count > 0)) {
      patterns.push({
        type: "recurring_issue",
        ruleId,
        title: `${rule.description_plain} keeps resurfacing`,
        evidence: `This rule failed in the last ${recent.length} completed audits.`,
        severity: rule.severity === "passing" ? "info" : rule.severity,
      });
    }

    if (recent.length === 3 && recent[0] < recent[1] && recent[1] < recent[2]) {
      patterns.push({
        type: "worsening_trend",
        ruleId,
        title: `${rule.description_plain} is getting worse`,
        evidence: `Violation counts climbed from ${recent[0]} to ${recent[2]} across the latest three runs.`,
        severity: rule.severity === "passing" ? "info" : rule.severity,
      });
    }

    const previous = counts.at(-2) ?? 0;
    const latest = counts.at(-1) ?? 0;
    if (previous === 0 && latest > 0) {
      patterns.push({
        type: "new_issue",
        ruleId,
        title: `${rule.description_plain} appeared in the latest audit`,
        evidence: `No prior findings in the previous run, then ${latest} new violations in the latest run.`,
        severity: rule.severity === "critical" ? "warning" : "info",
      });
    }
  }

  return patterns;
}
