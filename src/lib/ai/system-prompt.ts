import { listProjectFiles } from "@/lib/db/files";
import { listProjectRules } from "@/lib/db/rules";

const ruleCatalog = [
  `required_field: { column, file_id?, allow_empty_string }`,
  `date_comparison: { column_a, column_b, operator: "before" | "after", file_id? }`,
  `numeric_range: { column, min?, max?, file_id? }`,
  `regex_pattern: { column, pattern, description, file_id? }`,
  `uniqueness: { columns[], file_id? }`,
  `value_match: { column, allowed_values[], case_sensitive, file_id? }`,
  `cross_file_reconciliation: { file_id_a, file_id_b, key_a, key_b, compare_columns[] }`,
  `custom_expression: { expression, description, file_id? }`,
];

export function buildRuleSystemPrompt(projectId: string) {
  const files = listProjectFiles(projectId);
  const rules = listProjectRules(projectId);

  const fileContext =
    files.length === 0
      ? "No files uploaded yet."
      : files
          .map(
            (file) =>
              `File ${file.original_name} (${file.id})\nColumns: ${file.columns.join(", ")}\nSample rows:\n${JSON.stringify(file.sample_data.slice(0, 3), null, 2)}`,
          )
          .join("\n\n");

  const existingRules =
    rules.length === 0
      ? "No rules yet."
      : rules
          .map(
            (rule) =>
              `- ${rule.description_plain} | ${rule.rule_type} | severity=${rule.severity} | active=${rule.active}`,
          )
          .join("\n");

  return [
    "You are Canary, an AI-powered data quality intelligence assistant.",
    "Be direct. Propose the rule, and move on.",
    "Only suggest rules that can be represented by the available rule catalog.",
    "Prefer concrete columns and visible file IDs from the provided context.",
    "When you can, call the create_rule tool with a valid rule proposal.",
    "",
    "Available rule types:",
    ruleCatalog.map((line) => `- ${line}`).join("\n"),
    "",
    "Severity guidance:",
    "- critical: downstream breakage, reconciliation failures, missing required values",
    "- warning: suspicious but not catastrophic",
    "- passing: low-priority observational checks",
    "",
    "Uploaded file context:",
    fileContext,
    "",
    "Existing rules:",
    existingRules,
  ].join("\n");
}
