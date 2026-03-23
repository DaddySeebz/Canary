import { Parser } from "expr-eval";

import type { Evaluator } from "@/lib/rules/types";

import { customExpressionSchema } from "@/lib/rules/schemas";
import { getTargetFiles } from "@/lib/rules/evaluators/utils";

function sanitizeColumnName(columnName: string) {
  return columnName.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^[0-9]/, "_$&");
}

export const customExpressionEvaluator: Evaluator = (rawConfig, files) => {
  const config = customExpressionSchema.parse(rawConfig);
  const parser = new Parser();
  const findings = [];
  let expression;

  try {
    expression = parser.parse(config.expression);
  } catch {
    return [
      {
        file_id: config.file_id || Array.from(files.keys())[0] || "unknown",
        row_number: 0,
        column_name: null,
        value: config.expression,
        expected: "valid expression",
        message: "The custom expression could not be parsed.",
      },
    ];
  }

  for (const [fileId, context] of getTargetFiles(files, config.file_id)) {
    const mapping = new Map(context.columns.map((column) => [sanitizeColumnName(column), column]));

    for (const [index, row] of context.rows.entries()) {
      const variables = Object.fromEntries(
        Array.from(mapping.entries()).map(([sanitized, original]) => [sanitized, row[original] ?? ""]),
      );

      let result = false;

      try {
        result = Boolean(expression.evaluate(variables));
      } catch {
        findings.push({
          file_id: fileId,
          row_number: index + 1,
          column_name: null,
          value: null,
          expected: config.description,
          message: `Expression evaluation failed for this row.`,
        });
        continue;
      }

      if (!result) {
        findings.push({
          file_id: fileId,
          row_number: index + 1,
          column_name: null,
          value: null,
          expected: config.description,
          message: config.description,
        });
      }
    }
  }

  return findings;
};
