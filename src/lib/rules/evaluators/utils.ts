import type { EvalContext, EvalFinding } from "@/lib/rules/types";

export function getTargetFiles(files: Map<string, EvalContext>, fileId?: string) {
  if (fileId) {
    const context = files.get(fileId);
    return context ? ([[fileId, context]] as [string, EvalContext][]) : [];
  }

  return Array.from(files.entries()) as [string, EvalContext][];
}

export function buildMissingColumnFinding(
  fileId: string,
  columnName: string,
  message: string,
): EvalFinding {
  return {
    file_id: fileId,
    row_number: 0,
    column_name: columnName,
    value: null,
    expected: null,
    message,
  };
}

export function asString(value: unknown) {
  if (value == null) {
    return "";
  }

  return String(value);
}

export function parseNumber(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseDateValue(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
