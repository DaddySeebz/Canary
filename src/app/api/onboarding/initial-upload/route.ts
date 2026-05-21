import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getCsvMetadata } from "@/lib/csv/parser";
import { diffSchema } from "@/lib/csv/schema-diff";
import { saveUploadedCsv } from "@/lib/csv/storage";
import { logActivity } from "@/lib/db/activity";
import { createFileRecord, createFileSnapshot } from "@/lib/db/files";
import { createProject, touchProject } from "@/lib/db/projects";

export const runtime = "nodejs";
export const maxDuration = 60;

function getProjectNameFromFile(fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();

  if (!baseName) {
    return "Initial Data Audit";
  }

  return baseName
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
    const project = await createProject({
      userId,
      name: getProjectNameFromFile(file.name),
      description: "Created from the first uploaded onboarding dataset.",
    });
    const stored = await saveUploadedCsv(project.id, buffer);

    const created = await createFileRecord({
      projectId: project.id,
      filename: stored.filename,
      originalName: file.name,
      rowCount: metadata.rowCount,
      columns: metadata.columns,
      sampleData: metadata.sampleData,
      fileSize: buffer.byteLength,
    });

    await createFileSnapshot(created.id, metadata.columns, metadata.rowCount);

    const schemaDiff = diffSchema(null, created, []);

    await touchProject(project.id);
    await logActivity(
      project.id,
      "onboarding.initial_upload",
      JSON.stringify({ fileId: created.id, originalName: file.name, rowCount: created.row_count }),
    );

    return NextResponse.json({ project, file: created, schemaDiff }, { status: 201 });
  } catch (error) {
    console.error("Initial onboarding upload failed", error);
    return NextResponse.json({ error: "Initial upload failed" }, { status: 500 });
  }
}
