import { v4 as uuidv4 } from "uuid";

import { getDatabase } from "@/lib/db";
import type { ProjectRecord, ProjectSummary } from "@/lib/db/types";

export function listProjectsWithStats(userId: string) {
  const db = getDatabase();
  return db
    .prepare(
      `SELECT
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.created_at,
        p.updated_at,
        (SELECT COUNT(*) FROM files f WHERE f.project_id = p.id) AS file_count,
        (SELECT COUNT(*) FROM audit_rules r WHERE r.project_id = p.id) AS rule_count,
        (
          SELECT ar.id
          FROM audit_runs ar
          WHERE ar.project_id = p.id
          ORDER BY datetime(ar.ran_at) DESC
          LIMIT 1
        ) AS latest_run_id,
        (
          SELECT ar.ran_at
          FROM audit_runs ar
          WHERE ar.project_id = p.id
          ORDER BY datetime(ar.ran_at) DESC
          LIMIT 1
        ) AS latest_run_at,
        (
          SELECT ar.health_score
          FROM audit_runs ar
          WHERE ar.project_id = p.id
          ORDER BY datetime(ar.ran_at) DESC
          LIMIT 1
        ) AS latest_run_health_score,
        (
          SELECT ar.total_violations
          FROM audit_runs ar
          WHERE ar.project_id = p.id
          ORDER BY datetime(ar.ran_at) DESC
          LIMIT 1
        ) AS latest_run_violations
      FROM projects p
      WHERE p.user_id = ?
      ORDER BY datetime(p.updated_at) DESC`,
    )
    .all(userId) as ProjectSummary[];
}

export function createProject(input: { userId: string; name: string; description?: string | null }) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const project: ProjectRecord = {
    id: uuidv4(),
    user_id: input.userId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    created_at: now,
    updated_at: now,
  };

  db.prepare(
    `INSERT INTO projects (id, user_id, name, description, created_at, updated_at)
     VALUES (@id, @user_id, @name, @description, @created_at, @updated_at)`,
  ).run(project);

  return project;
}

export function getProjectById(projectId: string, userId: string) {
  return (
    (getDatabase()
      .prepare(
        `SELECT id, user_id, name, description, created_at, updated_at
         FROM projects
         WHERE id = ? AND user_id = ?`,
      )
      .get(projectId, userId) as ProjectRecord | undefined) ?? null
  );
}

export function getProjectSummary(projectId: string, userId: string) {
  return listProjectsWithStats(userId).find((project) => project.id === projectId) ?? null;
}

export function updateProject(
  projectId: string,
  userId: string,
  input: { name?: string; description?: string | null },
) {
  const existing = getProjectById(projectId, userId);
  if (!existing) {
    return null;
  }

  const updated: ProjectRecord = {
    ...existing,
    name: input.name?.trim() || existing.name,
    description:
      input.description === undefined ? existing.description : input.description?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  getDatabase()
    .prepare(
      `UPDATE projects
       SET name = @name, description = @description, updated_at = @updated_at
       WHERE id = @id`,
    )
    .run(updated);

  return updated;
}

export function touchProject(projectId: string) {
  getDatabase()
    .prepare(`UPDATE projects SET updated_at = ? WHERE id = ?`)
    .run(new Date().toISOString(), projectId);
}

export function deleteProject(projectId: string, userId: string) {
  return getDatabase()
    .prepare(`DELETE FROM projects WHERE id = ? AND user_id = ?`)
    .run(projectId, userId).changes > 0;
}
