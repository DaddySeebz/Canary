export type ResultSeverity = "critical" | "warning" | "passing";

export type AuditResultsRun = {
  id: string;
  project_id: string;
  ran_at: string;
  total_violations: number;
  total_rows_checked: number;
  status: string;
  duration_ms: number | null;
  health_score: number | null;
};

export type AuditResultsFinding = {
  id: string;
  run_id: string;
  rule_id: string;
  file_id: string;
  row_number: number;
  column_name: string | null;
  value: string | null;
  expected: string | null;
  message: string;
  severity: ResultSeverity;
};

export type AuditResultsResolution = {
  id: string;
  run_id: string;
  rule_id: string;
  summary: string;
  suggestion: string;
  affected_count: number;
  issue_type: string | null;
};

export type AuditResultsSummaryItem = {
  rule_id: string;
  description_plain: string;
  rule_type: string;
  severity: ResultSeverity;
  active: boolean;
  finding_count: number;
  file_count: number;
};

export type AuditResultsBundle = {
  run: AuditResultsRun;
  findings: AuditResultsFinding[];
  resolutions: AuditResultsResolution[];
  summary: AuditResultsSummaryItem[];
};

export type ResultSeverityCounts = {
  critical: number;
  warning: number;
  info: number;
};

export type ResultIssue = {
  ruleId: string;
  title: string;
  ruleType: string;
  severity: ResultSeverity;
  findingCount: number;
  fileCount: number;
  sampleFinding: AuditResultsFinding | null;
  resolutionSummary: string | null;
  resolutionSuggestion: string | null;
};

const severityRank: Record<ResultSeverity, number> = {
  critical: 0,
  warning: 1,
  passing: 2,
};

export function countResultSeverities(summary: AuditResultsSummaryItem[]): ResultSeverityCounts {
  return summary.reduce<ResultSeverityCounts>(
    (counts, item) => {
      if (item.finding_count > 0 && item.severity === "critical") {
        counts.critical += 1;
      } else if (item.finding_count > 0 && item.severity === "warning") {
        counts.warning += 1;
      } else {
        counts.info += 1;
      }

      return counts;
    },
    { critical: 0, warning: 0, info: 0 },
  );
}

export function buildResultIssues(bundle: AuditResultsBundle): ResultIssue[] {
  return bundle.summary
    .filter((item) => item.finding_count > 0)
    .map((item) => {
      const findings = bundle.findings.filter((finding) => finding.rule_id === item.rule_id);
      const resolution = bundle.resolutions.find((candidate) => candidate.rule_id === item.rule_id);

      return {
        ruleId: item.rule_id,
        title: item.description_plain,
        ruleType: item.rule_type,
        severity: item.severity,
        findingCount: item.finding_count,
        fileCount: item.file_count,
        sampleFinding: findings[0] ?? null,
        resolutionSummary: resolution?.summary ?? null,
        resolutionSuggestion: resolution?.suggestion ?? null,
      };
    })
    .sort((left, right) => {
      const severityDifference = severityRank[left.severity] - severityRank[right.severity];

      if (severityDifference !== 0) {
        return severityDifference;
      }

      return right.findingCount - left.findingCount;
    });
}
