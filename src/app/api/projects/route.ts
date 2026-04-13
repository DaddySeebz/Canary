import { auth } from "@clerk/nextjs/server";
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
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ projects: listProjectsWithStats(userId) });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createProjectSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const project = createProject({ ...body.data, userId });
  logActivity(project.id, "project.created", JSON.stringify({ name: project.name }));

  return NextResponse.json({ project }, { status: 201 });
}
