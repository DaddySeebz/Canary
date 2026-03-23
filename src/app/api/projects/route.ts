import { NextResponse } from "next/server";
import { z } from "zod";

import { logActivity } from "@/lib/db/activity";
import { createProject, listProjectsWithStats } from "@/lib/db/projects";

export const runtime = "nodejs";

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET() {
  return NextResponse.json({ projects: listProjectsWithStats() });
}

export async function POST(request: Request) {
  const body = createProjectSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const project = createProject(body.data);
  logActivity(project.id, "project.created", JSON.stringify({ name: project.name }));

  return NextResponse.json({ project }, { status: 201 });
}
