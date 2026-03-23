import type { Evaluator } from "@/lib/rules/types";

import { dateComparisonSchema } from "@/lib/rules/schemas";
import {
  buildMissingColumnFinding,
  getTargetFiles,
  parseDateValue,
} from "@/lib/rules/evaluators/utils";

export const dateComparisonEvaluator: Evaluator = (rawConfig, files) => {
  const config = dateComparisonSchema.parse(rawConfig);
  const findings = [];

  for (const [fileId, context] of getTargetFiles(files, config.file_id)) {
    for (const column of [config.column_a, config.column_b]) {
      if (!context.columns.includes(column)) {
        findings.push(
          buildMissingColumnFinding(fileId, column, `Column "${column}" is missing from the file.`),
        );
      }
    }

    if (
      !context.columns.includes(config.column_a) ||
      !context.columns.includes(config.column_b)
    ) {
      continue;
    }

    for (const [index, row] of context.rows.entries()) {
      const left = parseDateValue(row[config.column_a] ?? "");
      const right = parseDateValue(row[config.column_b] ?? "");

      if (!left || !right) {
        findings.push({
          file_id: fileId,
          row_number: index + 1,
          column_name: !left ? config.column_a : config.column_b,
          value: !left ? row[config.column_a] : row[config.column_b],
          expected: "valid date",
          message: `Expected both date fields to parse cleanly for comparison.`,
        });
        continue;
      }

      const isValid =
        config.operator === "before" ? left.getTime() < right.getTime() : left.getTime() > right.getTime();

      if (!isValid) {
        findings.push({
          file_id: fileId,
          row_number: index + 1,
          column_name: config.column_a,
          value: row[config.column_a] ?? "",
          expected: `${config.column_a} ${config.operator} ${config.column_b}`,
          message: `Expected ${config.column_a} to be ${config.operator} ${config.column_b}.`,
        });
      }
    }
  }

  return findings;
};
