export type RuleType =
  | "required_field"
  | "date_comparison"
  | "numeric_range"
  | "regex_pattern"
  | "uniqueness"
  | "value_match"
  | "cross_file_reconciliation"
  | "custom_expression";

export type RuleSeverity = "critical" | "warning" | "passing";

export interface EvalContext {
  fileId: string;
  rows: Record<string, string>[];
  columns: string[];
}

export interface EvalFinding {
  file_id: string;
  row_number: number;
  column_name: string | null;
  value: string | null;
  expected: string | null;
  message: string;
}

export type Evaluator = (
  config: Record<string, unknown>,
  files: Map<string, EvalContext>,
  severity: RuleSeverity,
) => EvalFinding[];
