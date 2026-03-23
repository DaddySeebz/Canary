import { z } from "zod";

import type { RuleType } from "@/lib/rules/types";

export const requiredFieldSchema = z.object({
  column: z.string().min(1),
  file_id: z.string().optional(),
  allow_empty_string: z.boolean().default(false),
});

export const dateComparisonSchema = z.object({
  column_a: z.string().min(1),
  column_b: z.string().min(1),
  operator: z.enum(["before", "after"]),
  file_id: z.string().optional(),
});

export const numericRangeSchema = z.object({
  column: z.string().min(1),
  min: z.number().optional(),
  max: z.number().optional(),
  file_id: z.string().optional(),
});

export const regexPatternSchema = z.object({
  column: z.string().min(1),
  pattern: z.string().min(1),
  description: z.string().min(1),
  file_id: z.string().optional(),
});

export const uniquenessSchema = z.object({
  columns: z.array(z.string().min(1)).min(1),
  file_id: z.string().optional(),
});

export const valueMatchSchema = z.object({
  column: z.string().min(1),
  allowed_values: z.array(z.string()).min(1),
  case_sensitive: z.boolean().default(false),
  file_id: z.string().optional(),
});

export const crossFileCompareSchema = z.union([
  z.string().min(1),
  z.object({
    column_a: z.string().min(1),
    column_b: z.string().min(1),
    tolerance: z.number().optional(),
  }),
]);

export const crossFileSchema = z.object({
  file_id_a: z.string().min(1),
  file_id_b: z.string().min(1),
  key_a: z.string().min(1),
  key_b: z.string().min(1),
  compare_columns: z.array(crossFileCompareSchema).default([]),
});

export const customExpressionSchema = z.object({
  expression: z.string().min(1),
  description: z.string().min(1),
  file_id: z.string().optional(),
});

export const genericRuleSchema = z.object({
  description_plain: z.string().min(1),
  rule_type: z.enum([
    "required_field",
    "date_comparison",
    "numeric_range",
    "regex_pattern",
    "uniqueness",
    "value_match",
    "cross_file_reconciliation",
    "custom_expression",
  ]),
  rule_config: z.record(z.string(), z.unknown()),
  severity: z.enum(["critical", "warning", "passing"]).default("critical"),
});

export const ruleSchemas = {
  required_field: requiredFieldSchema,
  date_comparison: dateComparisonSchema,
  numeric_range: numericRangeSchema,
  regex_pattern: regexPatternSchema,
  uniqueness: uniquenessSchema,
  value_match: valueMatchSchema,
  cross_file_reconciliation: crossFileSchema,
  custom_expression: customExpressionSchema,
} satisfies Record<RuleType, z.ZodType<Record<string, unknown>>>;

export function validateRuleConfig(ruleType: RuleType, config: Record<string, unknown>) {
  return ruleSchemas[ruleType].parse(config);
}
