import type { Evaluator } from "@/lib/rules/types";

import { uniquenessSchema } from "@/lib/rules/schemas";
import { buildMissingColumnFinding, getTargetFiles } from "@/lib/rules/evaluators/utils";

export const uniquenessEvaluator: Evaluator = (rawConfig, files) => {
  const config = uniquenessSchema.parse(rawConfig);
  const findings = [];

  for (const [fileId, context] of getTargetFiles(files, config.file_id)) {
    const missingColumns = config.columns.filter((column) => !context.columns.includes(column));
    for (const column of missingColumns) {
      findings.push(
        buildMissingColumnFinding(fileId, column, `Column "${column}" is missing from the file.`),
      );
    }

    if (missingColumns.length > 0) {
      continue;
    }

    const seen = new Map<string, number>();

    for (const [index, row] of context.rows.entries()) {
      const key = config.columns.map((column) => row[column] ?? "").join("::");
      const previousRow = seen.get(key);

      if (previousRow !== undefined) {
        findings.push({
          file_id: fileId,
          row_number: index + 1,
          column_name: config.columns.join(", "),
          value: key,
          expected: "unique combination",
          message: `Duplicate value combination first appeared on row ${previousRow}.`,
        });
      } else {
        seen.set(key, index + 1);
      }
    }
  }

  return findings;
};
