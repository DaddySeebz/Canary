import type { Evaluator } from "@/lib/rules/types";

import { crossFileSchema } from "@/lib/rules/schemas";
import { parseNumber } from "@/lib/rules/evaluators/utils";

export const crossFileEvaluator: Evaluator = (rawConfig, files) => {
  const config = crossFileSchema.parse(rawConfig);
  const fileA = files.get(config.file_id_a);
  const fileB = files.get(config.file_id_b);

  if (!fileA || !fileB) {
    return [];
  }

  const findings = [];
  const rightByKey = new Map<string, Record<string, string>>();

  for (const row of fileB.rows) {
    rightByKey.set(row[config.key_b] ?? "", row);
  }

  const comparisons = config.compare_columns.map((column) =>
    typeof column === "string"
      ? { column_a: column, column_b: column, tolerance: undefined as number | undefined }
      : column,
  );

  for (const [index, rowA] of fileA.rows.entries()) {
    const key = rowA[config.key_a] ?? "";
    const rowB = rightByKey.get(key);

    if (!rowB) {
      findings.push({
        file_id: config.file_id_a,
        row_number: index + 1,
        column_name: config.key_a,
        value: key,
        expected: `matching ${config.key_b} in comparison file`,
        message: `No matching record was found in the comparison file.`,
      });
      continue;
    }

    for (const comparison of comparisons) {
      const left = rowA[comparison.column_a] ?? "";
      const right = rowB[comparison.column_b] ?? "";

      if (comparison.tolerance !== undefined) {
        const leftNumber = parseNumber(left);
        const rightNumber = parseNumber(right);

        if (
          leftNumber === null ||
          rightNumber === null ||
          Math.abs(leftNumber - rightNumber) > comparison.tolerance
        ) {
          findings.push({
            file_id: config.file_id_a,
            row_number: index + 1,
            column_name: comparison.column_a,
            value: left,
            expected: `${comparison.column_b} within tolerance ${comparison.tolerance}`,
            message: `Cross-file numeric comparison exceeded tolerance.`,
          });
        }

        continue;
      }

      if (left !== right) {
        findings.push({
          file_id: config.file_id_a,
          row_number: index + 1,
          column_name: comparison.column_a,
          value: left,
          expected: right,
          message: `Cross-file values did not match.`,
        });
      }
    }
  }

  return findings;
};
