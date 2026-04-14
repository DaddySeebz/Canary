import { parseCsvText } from "@/lib/csv/parser";
import { readStoredCsvText } from "@/lib/csv/storage";
import { logActivity } from "@/lib/db/activity";
import { listProjectFiles } from "@/lib/db/files";
import { listActiveProjectRules } from "@/lib/db/rules";
import {
  completeAuditRun,
  createAuditRun,
  failAuditRun,
  insertFindings,
  insertResolutions,
} from "@/lib/db/runs";
import { touchProject } from "@/lib/db/projects";
import type { AuditRuleRecord } from "@/lib/db/types";
import type { EvalContext, EvalFinding, RuleSeverity, RuleType } from "@/lib/rules/types";
import { validateRuleConfig } from "@/lib/rules/schemas";
import { requiredFieldEvaluator } from "@/lib/rules/evaluators/required-field";
import { dateComparisonEvaluator } from "@/lib/rules/evaluators/date-comparison";
import { numericRangeEvaluator } from "@/lib/rules/evaluators/numeric-range";
import { regexPatternEvaluator } from "@/lib/rules/evaluators/regex-pattern";
import { uniquenessEvaluator } from "@/lib/rules/evaluators/uniqueness";
import { valueMatchEvaluator } from "@/lib/rules/evaluators/value-match";
import { crossFileEvaluator } from "@/lib/rules/evaluators/cross-file";
import { customExpressionEvaluator } from "@/lib/rules/evaluators/custom-expression";

type PendingFindingInsert = {
  file_id: string;
  row_number: number;
  column_name: string | null;
  value: string | null;
  expected: string | null;
  message: string;
  rule_id: string;
  severity: RuleSeverity;
};

const evaluators = {
  required_field: requiredFieldEvaluator,
  date_comparison: dateComparisonEvaluator,
  numeric_range: numericRangeEvaluator,
  regex_pattern: regexPatternEvaluator,
  uniqueness: uniquenessEvaluator,
  value_match: valueMatchEvaluator,
  cross_file_reconciliation: crossFileEvaluator,
  custom_expression: customExpressionEvaluator,
} satisfies Record<RuleType, typeof requiredFieldEvaluator>;

function buildResolution(rule: AuditRuleRecord, findings: EvalFinding[]) {
  return {
    rule_id: rule.id,
    summary:
      findings.length === 0
        ? "Rule passed cleanly."
        : `${findings.length} rows need attention for "${rule.description_plain}".`,
    suggestion: (() => {
      switch (rule.rule_type) {
        case "required_field":
          return "Fill missing values before the file moves downstream.";
        case "date_comparison":
          return "Check date sequencing and source-system timestamp logic.";
        case "numeric_range":
          return "Review thresholds and upstream numeric transforms.";
        case "regex_pattern":
          return "Standardize the source format before export.";
        case "uniqueness":
          return "Deduplicate the source rows or fix the key strategy.";
        case "value_match":
          return "Normalize values to the approved set.";
        case "cross_file_reconciliation":
          return "Reconcile the mismatched records across the two source files.";
        case "custom_expression":
          return "Review the business rule logic for rows that broke the expression.";
        default:
          return "Review the flagged rows and correct the source data.";
      }
    })(),
    affected_count: findings.length,
    issue_type: rule.rule_type,
  };
}

export async function runAudit(projectId: string) {
  const startedAt = Date.now();
  const run = await createAuditRun(projectId);
  const [files, rules] = await Promise.all([
    listProjectFiles(projectId),
    listActiveProjectRules(projectId),
  ]);

  if (files.length === 0 || rules.length === 0) {
    await failAuditRun(run.id);
    throw new Error("Audit requires at least one CSV file and one active rule.");
  }

  try {
    const contexts = new Map<string, EvalContext>();

    for (const file of files) {
      const parsed = parseCsvText(await readStoredCsvText(file.filename));
      contexts.set(file.id, {
        fileId: file.id,
        rows: parsed.rows,
        columns: parsed.columns,
      });
    }

    const findingsToInsert: PendingFindingInsert[] = [];
    const resolutions = [];
    let totalRowsChecked = 0;

    for (const context of contexts.values()) {
      totalRowsChecked += context.rows.length;
    }

    for (const rule of rules) {
      const config = validateRuleConfig(rule.rule_type, rule.rule_config);
      const evaluator = evaluators[rule.rule_type];
      const findings = evaluator(config, contexts, rule.severity);

      findingsToInsert.push(
        ...findings.map((finding) => ({
          ...finding,
          rule_id: rule.id,
          severity: rule.severity,
        })),
      );

      resolutions.push(buildResolution(rule, findings));
    }

    await insertFindings(run.id, findingsToInsert);
    await insertResolutions(run.id, resolutions);

    const denominator = Math.max(totalRowsChecked * rules.length, 1);
    const totalViolations = findingsToInsert.length;
    const healthScore = Math.max(
      0,
      Math.round(100 * (1 - totalViolations / denominator)),
    );

    await completeAuditRun({
      runId: run.id,
      totalViolations,
      totalRowsChecked,
      durationMs: Date.now() - startedAt,
      healthScore,
    });

    await touchProject(projectId);
    await logActivity(
      projectId,
      "audit.run",
      JSON.stringify({
        runId: run.id,
        totalViolations,
        totalRowsChecked,
        healthScore,
      }),
    );

    return {
      run_id: run.id,
      total_findings: totalViolations,
      total_rows_checked: totalRowsChecked,
      duration_ms: Date.now() - startedAt,
      health_score: healthScore,
    };
  } catch (error) {
    await failAuditRun(run.id);
    throw error;
  }
}
