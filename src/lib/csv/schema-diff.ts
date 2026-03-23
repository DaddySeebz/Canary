import type { AuditRuleRecord, FileRecord, SchemaDiffResult } from "@/lib/db/types";

function levenshtein(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array.from<number>({ length: b.length + 1 }).fill(0),
  );

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function similarity(a: string, b: string) {
  if (!a.length && !b.length) {
    return 1;
  }

  const distance = levenshtein(a.toLowerCase(), b.toLowerCase());
  return 1 - distance / Math.max(a.length, b.length);
}

function ruleTouchesColumn(rule: AuditRuleRecord, columnNames: string[]) {
  const payload = JSON.stringify(rule.rule_config).toLowerCase();
  return columnNames.some((column) => payload.includes(column.toLowerCase()));
}

export function diffSchema(
  previousFile: FileRecord | null,
  currentFile: FileRecord,
  rules: AuditRuleRecord[],
): SchemaDiffResult {
  if (!previousFile) {
    return {
      added: currentFile.columns,
      removed: [],
      renamed: [],
      affectedRules: [],
      previousFile: null,
    };
  }

  const previous = new Set(previousFile.columns);
  const current = new Set(currentFile.columns);

  const added = currentFile.columns.filter((column) => !previous.has(column));
  const removed = previousFile.columns.filter((column) => !current.has(column));

  const renamed: SchemaDiffResult["renamed"] = [];
  const unmatchedAdded = [...added];
  const unmatchedRemoved = [...removed];

  for (const oldColumn of removed) {
    let bestMatch: { column: string; score: number } | null = null;

    for (const newColumn of added) {
      if (!unmatchedAdded.includes(newColumn)) {
        continue;
      }

      const score = similarity(oldColumn, newColumn);
      if (score >= 0.6 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { column: newColumn, score };
      }
    }

    if (bestMatch) {
      renamed.push({
        from: oldColumn,
        to: bestMatch.column,
        similarity: Number(bestMatch.score.toFixed(2)),
      });
      unmatchedAdded.splice(unmatchedAdded.indexOf(bestMatch.column), 1);
      unmatchedRemoved.splice(unmatchedRemoved.indexOf(oldColumn), 1);
    }
  }

  const touchedColumns = [...unmatchedRemoved, ...renamed.map((item) => item.from)];
  const affectedRules = touchedColumns.length
    ? rules.filter((rule) => ruleTouchesColumn(rule, touchedColumns))
    : [];

  return {
    added: unmatchedAdded,
    removed: unmatchedRemoved,
    renamed,
    affectedRules,
    previousFile,
  };
}
