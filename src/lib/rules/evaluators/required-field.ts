import type { Evaluator } from "@/lib/rules/types";

import { requiredFieldSchema } from "@/lib/rules/schemas";
import { buildMissingColumnFinding, getTargetFiles } from "@/lib/rules/evaluators/utils";

export const requiredFieldEvaluator: Evaluator = (rawConfig, files) => {
  const config = requiredFieldSchema.parse(rawConfig);
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
      const isEmpty = config.allow_empty_string ? value == null : value.trim() === "";

      if (isEmpty) {
        findings.push({
          file_id: fileId,
          row_number: index + 1,
          column_name: config.column,
          value,
          expected: "non-empty value",
          message: `Expected "${config.column}" to be populated.`,
        });
      }
    }
  }

  return findings;
};
