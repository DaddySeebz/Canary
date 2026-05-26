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

type AuditProgressRule = {
  id: string;
  description_plain: string;
  rule_type: RuleType;
  severity: RuleSeverity;
};

export type AuditProgressEvent =
  | {
      type: "started";
      run_id: string;
      total_rows_checked: number;
      total_rules: number;
      rules: AuditProgressRule[];
    }
  | {
      type: "rule_started";
      run_id: string;
      rule: AuditProgressRule;
      rule_index: number;
      total_rules: number;
    }
  | {
      type: "rule_completed";
      run_id: string;
      rule: AuditProgressRule;
      rule_index: number;
      total_rules: number;
      finding_count: number;
    }
  | {
      type: "completed";
      run_id: string;
      total_findings: number;
      total_rows_checked: number;
      duration_ms: number;
      health_score: number;
    }
  | {
      type: "failed";
      run_id: string;
      error: string;
    };

type AuditProgressReporter = (event: AuditProgressEvent) => void | Promise<void>;

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

function toProgressRule(rule: AuditRuleRecord): AuditProgressRule {
  return {
    id: rule.id,
    description_plain: rule.description_plain,
    rule_type: rule.rule_type,
    severity: rule.severity,
  };
}

export async function runAudit(
  projectId: string,
  options: { onProgress?: AuditProgressReporter } = {},
) {
  const startedAt = Date.now();
  const run = await createAuditRun(projectId);

  try {
    const [files, rules] = await Promise.all([
      listProjectFiles(projectId),
      listActiveProjectRules(projectId),
    ]);

    if (files.length === 0 || rules.length === 0) {
      throw new Error("Audit requires at least one CSV file and one active rule.");
    }

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

    await options.onProgress?.({
      type: "started",
      run_id: run.id,
      total_rows_checked: totalRowsChecked,
      total_rules: rules.length,
      rules: rules.map(toProgressRule),
    });

    for (const [index, rule] of rules.entries()) {
      const progressRule = toProgressRule(rule);

      await options.onProgress?.({
        type: "rule_started",
        run_id: run.id,
        rule: progressRule,
        rule_index: index + 1,
        total_rules: rules.length,
      });

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

      await options.onProgress?.({
        type: "rule_completed",
        run_id: run.id,
        rule: progressRule,
        rule_index: index + 1,
        total_rules: rules.length,
        finding_count: findings.length,
      });
    }

    await insertFindings(run.id, findingsToInsert);
    await insertResolutions(run.id, resolutions);

    const denominator = Math.max(totalRowsChecked * rules.length, 1);
    const totalViolations = findingsToInsert.length;
    const healthScore = Math.max(
      0,
      Math.round(100 * (1 - totalViolations / denominator)),
    );

    const durationMs = Date.now() - startedAt;

    await completeAuditRun({
      runId: run.id,
      totalViolations,
      totalRowsChecked,
      durationMs,
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

    const result = {
      run_id: run.id,
      total_findings: totalViolations,
      total_rows_checked: totalRowsChecked,
      duration_ms: durationMs,
      health_score: healthScore,
    };

    await options.onProgress?.({
      type: "completed",
      ...result,
    });

    return result;
  } catch (error) {
    await failAuditRun(run.id);
    await options.onProgress?.({
      type: "failed",
      run_id: run.id,
      error: error instanceof Error ? error.message : "Audit failed",
    });
    throw error;
  }
}
