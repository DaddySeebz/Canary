import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { deleteProjectUploads } from "@/lib/csv/storage";
import { logActivity } from "@/lib/db/activity";
import {
  deleteProject,
  getProjectSummary,
  updateProject,
} from "@/lib/db/projects";

export const runtime = "nodejs";

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = getProjectSummary(id, userId);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = updateProjectSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const project = updateProject(id, userId, body.data);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  logActivity(id, "project.updated", JSON.stringify(body.data));
  return NextResponse.json({ project });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = deleteProject(id, userId);

  if (!deleted) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  deleteProjectUploads(id);
  return NextResponse.json({ success: true });
}
