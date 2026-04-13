import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { getProjectById } from "@/lib/db/projects";

export async function requireUserId() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  return userId;
}

export async function getOptionalUserId() {
  const { userId } = await auth();
  return userId;
}

export async function requireOwnedProject(projectId: string) {
  const userId = await requireUserId();
  const project = getProjectById(projectId, userId);

  if (!project) {
    notFound();
  }

  return { userId, project };
}
