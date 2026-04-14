import { v4 as uuidv4 } from "uuid";

import { getDatabase, parseJsonColumn, queryRow, queryRows, toJson } from "@/lib/db";
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

export async function createFileRecord(input: {
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

  const db = await getDatabase();
  await db.query(
    `INSERT INTO files (id, project_id, filename, original_name, uploaded_at, row_count, columns, sample_data, file_size)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      file.id,
      file.project_id,
      file.filename,
      file.original_name,
      file.uploaded_at,
      file.row_count,
      toJson(file.columns),
      toJson(file.sample_data),
      file.file_size,
    ],
  );

  return file;
}

export async function listProjectFiles(projectId: string) {
  const rows = await queryRows<RawFileRow>(
    `SELECT id, project_id, filename, original_name, uploaded_at, row_count, columns, sample_data, file_size
     FROM files
     WHERE project_id = $1
     ORDER BY uploaded_at DESC`,
    [projectId],
  );

  return rows.map(mapFileRow);
}

export async function getFileById(fileId: string) {
  const row = await queryRow<RawFileRow>(
    `SELECT id, project_id, filename, original_name, uploaded_at, row_count, columns, sample_data, file_size
     FROM files
     WHERE id = $1`,
    [fileId],
  );

  return row ? mapFileRow(row) : null;
}

export async function createFileSnapshot(fileId: string, columns: string[], rowCount: number) {
  const snapshot: FileSnapshotRecord = {
    id: uuidv4(),
    file_id: fileId,
    columns,
    row_count: rowCount,
    uploaded_at: new Date().toISOString(),
  };

  const db = await getDatabase();
  await db.query(
    `INSERT INTO file_snapshots (id, file_id, columns, row_count, uploaded_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      snapshot.id,
      snapshot.file_id,
      toJson(snapshot.columns),
      snapshot.row_count,
      snapshot.uploaded_at,
    ],
  );

  return snapshot;
}

export async function getPreviousFileVersion(
  projectId: string,
  originalName: string,
  currentFileId: string,
) {
  const row = await queryRow<RawFileRow>(
    `SELECT id, project_id, filename, original_name, uploaded_at, row_count, columns, sample_data, file_size
     FROM files
     WHERE project_id = $1 AND original_name = $2 AND id != $3
     ORDER BY uploaded_at DESC
     LIMIT 1`,
    [projectId, originalName, currentFileId],
  );

  return row ? mapFileRow(row) : null;
}
