import assert from "node:assert/strict";
import test from "node:test";

import { buildResultIssues, countResultSeverities } from "./audit-results-utils.ts";
import type { AuditResultsBundle } from "./audit-results-utils.ts";

const bundle: AuditResultsBundle = {
  run: {
    id: "run-12345678",
    project_id: "project-1",
    ran_at: "2026-05-14T16:24:00.000Z",
    total_violations: 10,
    total_rows_checked: 1200,
    status: "completed",
    duration_ms: 862000,
    health_score: 94,
  },
  findings: [
    {
      id: "finding-warning",
      run_id: "run-12345678",
      rule_id: "warning-rule",
      file_id: "file-1",
      row_number: 9,
      column_name: "net_revenue",
      value: "9900",
      expected: "<= 5000",
      message: "Revenue exceeds expected variance.",
      severity: "warning",
    },
    {
      id: "finding-critical",
      run_id: "run-12345678",
      rule_id: "critical-rule",
      file_id: "file-1",
      row_number: 4,
      column_name: "contact_email",
      value: "",
      expected: "non-empty",
      message: "Required contact email is missing.",
      severity: "critical",
    },
  ],
  resolutions: [
    {
      id: "resolution-critical",
      run_id: "run-12345678",
      rule_id: "critical-rule",
      summary: "Missing required contact emails.",
      suggestion: "Fill missing values before the file moves downstream.",
      affected_count: 3,
      issue_type: "required_field",
    },
  ],
  summary: [
    {
      rule_id: "warning-rule",
      description_plain: "Revenue out of range",
      rule_type: "numeric_range",
      severity: "warning",
      active: true,
      finding_count: 7,
      file_count: 1,
    },
    {
      rule_id: "passing-rule",
      description_plain: "Currency allowlist",
      rule_type: "value_match",
      severity: "critical",
      active: true,
      finding_count: 0,
      file_count: 0,
    },
    {
      rule_id: "critical-rule",
      description_plain: "Missing email in lead field",
      rule_type: "required_field",
      severity: "critical",
      active: true,
      finding_count: 3,
      file_count: 1,
    },
  ],
};

test("countResultSeverities maps zero-finding rules to info", () => {
  assert.deepEqual(countResultSeverities(bundle.summary), {
    critical: 1,
    warning: 1,
    info: 1,
  });
});

test("buildResultIssues sorts actionable issues by severity before count", () => {
  const issues = buildResultIssues(bundle);

  assert.equal(issues.length, 2);
  assert.equal(issues[0].ruleId, "critical-rule");
  assert.equal(issues[0].severity, "critical");
  assert.equal(issues[0].sampleFinding?.column_name, "contact_email");
  assert.equal(issues[0].resolutionSuggestion, "Fill missing values before the file moves downstream.");
  assert.equal(issues[1].ruleId, "warning-rule");
  assert.equal(issues[1].severity, "warning");
});
