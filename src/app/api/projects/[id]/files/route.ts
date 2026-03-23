import { NextResponse } from "next/server";

import { diffSchema } from "@/lib/csv/schema-diff";
import { saveUploadedCsv } from "@/lib/csv/storage";
import { getCsvMetadata } from "@/lib/csv/parser";
import { logActivity } from "@/lib/db/activity";
import {
  createFileRecord,
  createFileSnapshot,
  getPreviousFileVersion,
  listProjectFiles,
} from "@/lib/db/files";
import { getProjectById, touchProject } from "@/lib/db/projects";
import { listProjectRules } from "@/lib/db/rules";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return NextResponse.json({ files: listProjectFiles(id) });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const project = getProjectById(id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing CSV upload" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ error: "Only .csv files are supported" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = buffer.toString("utf8");
  const metadata = getCsvMetadata(text);
  const stored = saveUploadedCsv(id, buffer);

  const created = createFileRecord({
    projectId: id,
    filename: stored.filename,
    originalName: file.name,
    rowCount: metadata.rowCount,
    columns: metadata.columns,
    sampleData: metadata.sampleData,
    fileSize: buffer.byteLength,
  });

  createFileSnapshot(created.id, metadata.columns, metadata.rowCount);

  const previousFile = getPreviousFileVersion(id, file.name, created.id);
  const schemaDiff = diffSchema(previousFile, created, listProjectRules(id));

  touchProject(id);
  logActivity(
    id,
    "file.uploaded",
    JSON.stringify({ fileId: created.id, originalName: file.name, rowCount: created.row_count }),
  );

  return NextResponse.json({ file: created, schemaDiff }, { status: 201 });
}
