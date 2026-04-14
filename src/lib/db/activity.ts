import { v4 as uuidv4 } from "uuid";

import { getDatabase, queryRows } from "@/lib/db";
import type { ActivityRecord } from "@/lib/db/types";

export async function logActivity(projectId: string, action: string, details?: string | null) {
  const db = await getDatabase();
  const entry: ActivityRecord = {
    id: uuidv4(),
    project_id: projectId,
    action,
    details: details ?? null,
    created_at: new Date().toISOString(),
  };

  await db.query(
    `INSERT INTO activity_log (id, project_id, action, details, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [entry.id, entry.project_id, entry.action, entry.details, entry.created_at],
  );

  return entry;
}

export async function listActivity(projectId: string) {
  return await queryRows<ActivityRecord>(
    `SELECT id, project_id, action, details, created_at
     FROM activity_log
     WHERE project_id = $1
     ORDER BY created_at DESC`,
    [projectId],
  );
}
