import type { Evaluator } from "@/lib/rules/types";

import { numericRangeSchema } from "@/lib/rules/schemas";
import {
  buildMissingColumnFinding,
  getTargetFiles,
  parseNumber,
} from "@/lib/rules/evaluators/utils";

export const numericRangeEvaluator: Evaluator = (rawConfig, files) => {
  const config = numericRangeSchema.parse(rawConfig);
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
      const rawValue = row[config.column] ?? "";
      const value = parseNumber(rawValue);

      if (value === null) {
        findings.push({
          file_id: fileId,
          row_number: index + 1,
          column_name: config.column,
          value: rawValue,
          expected: "numeric value",
          message: `Expected "${config.column}" to be numeric.`,
        });
        continue;
      }

      if (config.min !== undefined && value < config.min) {
        findings.push({
          file_id: fileId,
          row_number: index + 1,
          column_name: config.column,
          value: rawValue,
          expected: `>= ${config.min}`,
          message: `Value fell below the configured minimum.`,
        });
      }

      if (config.max !== undefined && value > config.max) {
        findings.push({
          file_id: fileId,
          row_number: index + 1,
          column_name: config.column,
          value: rawValue,
          expected: `<= ${config.max}`,
          message: `Value exceeded the configured maximum.`,
        });
      }
    }
  }

  return findings;
};
