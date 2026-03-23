import type { Evaluator } from "@/lib/rules/types";

import { valueMatchSchema } from "@/lib/rules/schemas";
import { buildMissingColumnFinding, getTargetFiles } from "@/lib/rules/evaluators/utils";

export const valueMatchEvaluator: Evaluator = (rawConfig, files) => {
  const config = valueMatchSchema.parse(rawConfig);
  const allowed = config.case_sensitive
    ? new Set(config.allowed_values)
    : new Set(config.allowed_values.map((value) => value.toLowerCase()));
  const findings = [];

  for (const [fileId, context] of getTargetFiles(files, config.file_id)) {
    if (!context.columns.includes(config.column)) {
      findings.push(
        buildMissingColumnFinding(
          fileId,
          config.column,
          `Column "${config.column}" is missing from the file.`,
        ),
      );
      continue;
    }

    for (const [index, row] of context.rows.entries()) {
      const value = row[config.column] ?? "";
      const comparable = config.case_sensitive ? value : value.toLowerCase();

      if (!allowed.has(comparable)) {
        findings.push({
          file_id: fileId,
          row_number: index + 1,
          column_name: config.column,
          value,
          expected: config.allowed_values.join(", "),
          message: `Value was not in the allowed set.`,
        });
      }
    }
  }

  return findings;
};
