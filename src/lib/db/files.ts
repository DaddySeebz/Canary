import { v4 as uuidv4 } from "uuid";

import { getDatabase, parseJsonColumn, toJson } from "@/lib/db";
import type { FileRecord, FileSnapshotRecord } from "@/lib/db/types";

type RawFileRow = Omit<FileRecord, "columns" | "sample_data"> & {
  columns: string;
  sample_data: string | null;
};

function mapFileRow(row: RawFileRow): FileRecord {
  return {
    ...row,
    columns: parseJsonColumn<string[]>(row.columns, []),
    sample_data: parseJsonColumn<Array<Record<string, string>>>(row.sample_data, []),
  };
}

export function createFileRecord(input: {
  projectId: string;
  filename: string;
  originalName: string;
  rowCount: number;
  columns: string[];
  sampleData: Array<Record<string, string>>;
  fileSize: number;
}) {
  const file: FileRecord = {
    id: uuidv4(),
    project_id: input.projectId,
    filename: input.filename,
    original_name: input.originalName,
    uploaded_at: new Date().toISOString(),
    row_count: input.rowCount,
    columns: input.columns,
    sample_data: input.sampleData,
    file_size: input.fileSize,
  };

  getDatabase()
    .prepare(
      `INSERT INTO files (id, project_id, filename, original_name, uploaded_at, row_count, columns, sample_data, file_size)
       VALUES (@id, @project_id, @filename, @original_name, @uploaded_at, @row_count, @columns, @sample_data, @file_size)`,
    )
    .run({
      ...file,
      columns: toJson(file.columns),
      sample_data: toJson(file.sample_data),
    });

  return file;
}

export function listProjectFiles(projectId: string) {
  const rows = getDatabase()
    .prepare(
      `SELECT id, project_id, filename, original_name, uploaded_at, row_count, columns, sample_data, file_size
       FROM files
       WHERE project_id = ?
       ORDER BY datetime(uploaded_at) DESC`,
    )
    .all(projectId) as RawFileRow[];

  return rows.map(mapFileRow);
}

export function getFileById(fileId: string) {
  const row = getDatabase()
    .prepare(
      `SELECT id, project_id, filename, original_name, uploaded_at, row_count, columns, sample_data, file_size
       FROM files
       WHERE id = ?`,
    )
    .get(fileId) as RawFileRow | undefined;

  return row ? mapFileRow(row) : null;
}

export function createFileSnapshot(fileId: string, columns: string[], rowCount: number) {
  const snapshot: FileSnapshotRecord = {
    id: uuidv4(),
    file_id: fileId,
    columns,
    row_count: rowCount,
    uploaded_at: new Date().toISOString(),
  };

  getDatabase()
    .prepare(
      `INSERT INTO file_snapshots (id, file_id, columns, row_count, uploaded_at)
       VALUES (@id, @file_id, @columns, @row_count, @uploaded_at)`,
    )
    .run({
      ...snapshot,
      columns: toJson(snapshot.columns),
    });

  return snapshot;
}

export function getPreviousFileVersion(projectId: string, originalName: string, currentFileId: string) {
  const row = getDatabase()
    .prepare(
      `SELECT id, project_id, filename, original_name, uploaded_at, row_count, columns, sample_data, file_size
       FROM files
       WHERE project_id = ? AND original_name = ? AND id != ?
       ORDER BY datetime(uploaded_at) DESC
       LIMIT 1`,
    )
    .get(projectId, originalName, currentFileId) as RawFileRow | undefined;

  return row ? mapFileRow(row) : null;
}
