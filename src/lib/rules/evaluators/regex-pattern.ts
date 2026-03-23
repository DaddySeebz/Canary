import type { Evaluator } from "@/lib/rules/types";

import { regexPatternSchema } from "@/lib/rules/schemas";
import { buildMissingColumnFinding, getTargetFiles } from "@/lib/rules/evaluators/utils";

export const regexPatternEvaluator: Evaluator = (rawConfig, files) => {
  const config = regexPatternSchema.parse(rawConfig);
  const findings = [];
  let expression: RegExp;

  try {
    expression = new RegExp(config.pattern);
  } catch {
    return [
      {
        file_id: config.file_id || Array.from(files.keys())[0] || "unknown",
        row_number: 0,
        column_name: config.column,
        value: config.pattern,
        expected: "valid regex",
        message: "The configured regex pattern could not be compiled.",
      },
    ];
  }

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
      if (!expression.test(value)) {
        findings.push({
          file_id: fileId,
          row_number: index + 1,
          column_name: config.column,
          value,
          expected: config.description,
          message: `Value did not match the expected pattern.`,
        });
      }
    }
  }

  return findings;
};
