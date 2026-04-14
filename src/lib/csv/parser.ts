import Papa from "papaparse";

export interface ParsedCsvData {
  rows: Array<Record<string, string>>;
  columns: string[];
}

function normalizeRow(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, value == null ? "" : String(value)]),
  );
}

export function parseCsvText(text: string): ParsedCsvData {
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0]?.message || "Failed to parse CSV");
  }

  const rows = parsed.data.map(normalizeRow);
  const columns = parsed.meta.fields?.filter(Boolean) || Object.keys(rows[0] || {});

  return { rows, columns };
}

export function getCsvMetadata(text: string) {
  const { rows, columns } = parseCsvText(text);
  return {
    rowCount: rows.length,
    columns,
    sampleData: rows.slice(0, 5),
  };
}
