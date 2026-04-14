import { v4 as uuidv4 } from "uuid";

import { getDatabase, queryRow, queryRows } from "@/lib/db";
import type { ProjectRecord, ProjectSummary } from "@/lib/db/types";

type RawProjectSummary = Omit<
  ProjectSummary,
  "file_count" | "rule_count" | "latest_run_health_score" | "latest_run_violations"
> & {
  file_count: number | string;
  rule_count: number | string;
  latest_run_health_score: number | string | null;
  latest_run_violations: number | string | null;
};

const projectSummarySelect = `
  SELECT
    p.id,
    p.user_id,
    p.name,
    p.description,
    p.created_at,
    p.updated_at,
    (SELECT COUNT(*)::int FROM files f WHERE f.project_id = p.id) AS file_count,
    (SELECT COUNT(*)::int FROM audit_rules r WHERE r.project_id = p.id) AS rule_count,
    (
      SELECT ar.id
      FROM audit_runs ar
      WHERE ar.project_id = p.id
      ORDER BY ar.ran_at DESC
      LIMIT 1
    ) AS latest_run_id,
    (
      SELECT ar.ran_at
      FROM audit_runs ar
      WHERE ar.project_id = p.id
      ORDER BY ar.ran_at DESC
      LIMIT 1
    ) AS latest_run_at,
    (
      SELECT ar.health_score
      FROM audit_runs ar
      WHERE ar.project_id = p.id
      ORDER BY ar.ran_at DESC
      LIMIT 1
    ) AS latest_run_health_score,
    (
      SELECT ar.total_violations
      FROM audit_runs ar
      WHERE ar.project_id = p.id
      ORDER BY ar.ran_at DESC
      LIMIT 1
    ) AS latest_run_violations
  FROM projects p
`;

function toNullableNumber(value: number | string | null) {
  if (value == null) {
    return null;
  }

  return Number(value);
}

function mapProjectSummaryRow(row: RawProjectSummary): ProjectSummary {
  return {
    ...row,
    file_count: Number(row.file_count),
    rule_count: Number(row.rule_count),
    latest_run_health_score: toNullableNumber(row.latest_run_health_score),
    latest_run_violations: toNullableNumber(row.latest_run_violations),
  };
}

export async function listProjectsWithStats(userId: string) {
  const rows = await queryRows<RawProjectSummary>(
    `${projectSummarySelect}
     WHERE p.user_id = $1
     ORDER BY p.updated_at DESC`,
    [userId],
  );

  return rows.map(mapProjectSummaryRow);
}

export async function createProject(input: {
  userId: string;
  name: string;
  description?: string | null;
}) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const project: ProjectRecord = {
    id: uuidv4(),
    user_id: input.userId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    created_at: now,
    updated_at: now,
  };

  await db.query(
    `INSERT INTO projects (id, user_id, name, description, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      project.id,
      project.user_id,
      project.name,
      project.description,
      project.created_at,
      project.updated_at,
    ],
  );

  return project;
}

export async function getProjectById(projectId: string, userId: string) {
  return await queryRow<ProjectRecord>(
    `SELECT id, user_id, name, description, created_at, updated_at
     FROM projects
     WHERE id = $1 AND user_id = $2`,
    [projectId, userId],
  );
}

export async function getPublicProjectById(projectId: string) {
  return await queryRow<ProjectRecord>(
    `SELECT id, user_id, name, description, created_at, updated_at
     FROM projects
     WHERE id = $1 AND user_id IS NULL`,
    [projectId],
  );
}

export async function getProjectSummary(projectId: string, userId: string) {
  const row = await queryRow<RawProjectSummary>(
    `${projectSummarySelect}
     WHERE p.id = $1 AND p.user_id = $2`,
    [projectId, userId],
  );

  return row ? mapProjectSummaryRow(row) : null;
}

export async function updateProject(
  projectId: string,
  userId: string,
  input: { name?: string; description?: string | null },
) {
  const existing = await getProjectById(projectId, userId);
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

  const db = await getDatabase();
  await db.query(
    `UPDATE projects
     SET name = $1, description = $2, updated_at = $3
     WHERE id = $4`,
    [updated.name, updated.description, updated.updated_at, updated.id],
  );

  return updated;
}

export async function touchProject(projectId: string) {
  const db = await getDatabase();
  await db.query(`UPDATE projects SET updated_at = $1 WHERE id = $2`, [
    new Date().toISOString(),
    projectId,
  ]);
}

export async function deleteProject(projectId: string, userId: string) {
  const deleted = await queryRow<{ id: string }>(
    `DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id`,
    [projectId, userId],
  );

  return Boolean(deleted);
}
