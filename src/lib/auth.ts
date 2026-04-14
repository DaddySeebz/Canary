import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { getProjectById } from "@/lib/db/projects";
import { isClerkConfigured } from "@/lib/env";

export async function requireUserId() {
  if (!isClerkConfigured()) {
    redirect("/login");
  }

  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  return userId;
}

export async function getOptionalUserId() {
  if (!isClerkConfigured()) {
    return null;
  }

  const { userId } = await auth();
  return userId;
}

export async function requireOwnedProject(projectId: string) {
  const userId = await requireUserId();
  const project = await getProjectById(projectId, userId);

  if (!project) {
    notFound();
  }

  return { userId, project };
}
